# test_redis_connection.py - Test if Redis is working
import redis
import sys

def test_redis_connection():
    try:
        # Connect to Redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        
        # Test basic operations
        r.set('test_key', 'Hello Redis!')
        value = r.get('test_key')
        
        if value == b'Hello Redis!':
            print("✅ Redis is working correctly!")
            print(f"✅ Retrieved value: {value.decode()}")
            
            # Clean up
            r.delete('test_key')
            return True
        else:
            print("❌ Redis connection failed - unexpected value")
            return False
            
    except redis.ConnectionError:
        print("❌ Redis connection failed - is Redis server running?")
        print("Try running: redis-server")
        return False
    except Exception as e:
        print(f"❌ Redis test failed: {str(e)}")
        return False

def test_celery_redis():
    try:
        from celery import Celery
        
        # Create a test Celery app
        test_app = Celery('test')
        test_app.conf.update(
            broker_url='redis://localhost:6379/0',
            result_backend='redis://localhost:6379/0'
        )
        
        # Test connection
        inspect = test_app.control.inspect()
        print("✅ Celery can connect to Redis broker")
        return True
        
    except Exception as e:
        print(f"❌ Celery Redis connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Redis connection...")
    redis_ok = test_redis_connection()
    
    print("\nTesting Celery Redis connection...")
    celery_ok = test_celery_redis()
    
    if redis_ok and celery_ok:
        print("\n🎉 All tests passed! Redis is ready for Celery.")
    else:
        print("\n⚠️  Some tests failed. Check Redis installation.")
        sys.exit(1)