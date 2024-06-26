import json

from channels.generic.websocket import AsyncWebsocketConsumer

#클라이언트로 부터 메시지를 받아서 다시 반환
class GroupConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = f"group_{self.group_id}"
        
        #비동기 그룹 생성
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    #웹소켓으로부터 메시지를 받았을 때
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = None
        type = text_data_json["type"]
        message = text_data_json["message"]
        param = text_data_json["param"]
        
        #그룹 세션이 끊길 때 해당 type 호출 -> 소켓 끊기
        if type == "disconnect":
           return await self.close()

        #즉, 여기까지는 클라이언트로 부터 받은 메시지에 해당함

        message = { "type" : type, "message" : message, "param" : param }
        #그룹에 메시지를 보낸다
        await self.channel_layer.group_send(
            self.group_name, {"type": "group.message", "message": message}
        )

    #그룹으로부터 메시지를 수신했을 때
    #type : "group.message" == group_message 함수와 매핑됩니다.
    async def group_message(self, event):
        type = event["message"]["type"]
        message = event["message"]["message"]
        param = event["message"]["param"]

        #이곳에서 참조하는 self.user_id는 각 채널에 해당하는 user_id가 된다.
        if type == "conn_broadcast":
            param = self.user_id

        if type == 'dconn_broadcast':
            param = self.user_id

        #웹소켓으로 다시 보낸다.
        await self.send(text_data=json.dumps({
            "type" : type,
            "message": message,
            "param" : param
        }))
    

