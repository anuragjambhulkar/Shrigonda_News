import unittest
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

class TestMongoDBConnection(unittest.TestCase):
    def test_connection(self):
        uri = "mongodb+srv://rameshbhos96_db_user:Ql5bfboTnVvQwwP1@cluster0.mirjol4.mongodb.net/shrigonda_news"
        client = None  # Initialize client to None
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            print("MongoDB connection successful.")
        except ConnectionFailure as e:
            self.fail(f"MongoDB connection failed: {e}")
        except Exception as e:
            selfs.fail(f"An unexpected error occurred: {e}")
        finally:
            if client:
                client.close()

if __name__ == '__main__':
    unittest.main()