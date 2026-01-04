"""
Test MongoDB Atlas connection and display database information.
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config import MONGO_URI, MONGO_DB_NAME
from database.mongodb import get_mongo_client, get_database, test_connection

def main():
    """Test MongoDB Atlas connection"""
    print("=" * 60)
    print("MongoDB Atlas Connection Test")
    print("=" * 60)
    print()
    
    if not MONGO_URI:
        print("✗ MONGO_URI not configured in .env file")
        print()
        print("Please add to your .env file:")
        print("MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/")
        print("MONGO_DB_NAME=shrimp_farm")
        return
    
    print(f"MongoDB URI: {MONGO_URI[:50]}...")  # Show first 50 chars
    print(f"Database Name: {MONGO_DB_NAME}")
    print()
    
    try:
        # Test connection
        print("Testing connection...")
        if test_connection():
            print("✓ Successfully connected to MongoDB Atlas!")
            print()
        else:
            print("✗ Connection failed")
            return
        
        # Get client and database
        client = get_mongo_client()
        db = get_database(client)
        
        # List databases
        print("Available databases:")
        for db_name in client.list_database_names():
            marker = " ← current" if db_name == MONGO_DB_NAME else ""
            print(f"  - {db_name}{marker}")
        
        print()
        
        # List collections
        collections = db.list_collection_names()
        print(f"Collections in '{MONGO_DB_NAME}':")
        if collections:
            for col in collections:
                count = db[col].count_documents({})
                print(f"  - {col}: {count:,} documents")
                
                # Show sample document structure for water_quality_readings
                if col == "water_quality_readings" and count > 0:
                    sample = db[col].find_one()
                    if sample:
                        print(f"    Sample fields: {', '.join([k for k in sample.keys() if k != '_id'])}")
        else:
            print("  (no collections yet)")
        
        print()
        
        # Test query performance
        if "water_quality_readings" in collections:
            collection = db["water_quality_readings"]
            count = collection.count_documents({})
            if count > 0:
                print("Query performance test:")
                
                # Test index usage
                import time
                start = time.time()
                result = list(collection.find({"pond_id": 1}).limit(10).sort("timestamp", -1))
                query_time = (time.time() - start) * 1000
                print(f"  Latest 10 readings for Pond 1: {query_time:.2f}ms")
                
                # Status distribution
                pipeline = [
                    {"$group": {"_id": "$status", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}}
                ]
                status_dist = list(collection.aggregate(pipeline))
                if status_dist:
                    print("  Status distribution:")
                    for item in status_dist:
                        print(f"    {item['_id']}: {item['count']} documents")
        
        client.close()
        print()
        print("✓ Connection test successful!")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        print()
        print("Troubleshooting:")
        print("1. Check your MONGO_URI in .env file")
        print("2. Verify your IP is whitelisted in Atlas Network Access")
        print("3. Verify your database user credentials")
        print("4. Check if your cluster is running")
        print("5. Ensure your connection string includes authentication")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()




