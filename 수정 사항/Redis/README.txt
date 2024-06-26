Channels-Redis 웹소켓 적용
#필요 모듈 -> 가상환경 내부에 설치

-웹소켓
pip install -U channels

-비동기 서버 환경
pip install daphne

-channel - redis 연동
pip install channels_redis

#redisDB windows fork ver(비관계형 DB) - msi
https://github.com/tporadowski/redis/releases

redis-server 실행한 상태에서
그룹 들어가면 소켓이 활성화됩니다.

-----------------------------------------------------------
#REDIS 오류 수정 파일

-> 아래 0,1번 파일을 redis 경로에 덮어씌웁니다.

0. redis.windows.conf
redis 오류 수정한 configure 파일입니다.
maxmemory 설정 및 rdb.dump 저장소 위치 지정

1. data 폴더
rdb.dump 파일입니다. 설정 안되어있으면
도중에 redis에 오류가 발생하는 것 같습니다.

2. Redis server 실행 배치파일입니다.
서버 실행할 때 conf파일 인식시켜줍니다.
해당 배치를 Redis 설치 위치로 수정하신뒤 
.bat 확장자로 바꿔서 실행하시면 됩니다.

#실행이 안되는 경우 
작업관리자 -> 서비스 -> Redis 중단하고 수동으로 
서버 배치파일 실행하시면 됩니다.

 