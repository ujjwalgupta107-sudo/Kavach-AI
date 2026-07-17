import httpx
import asyncio

async def run_api_tests():
    base_url = "http://localhost:8000/api/v1"
    
    async with httpx.AsyncClient() as client:
        print("\n--- AUTHENTICATION ---")
        login_res = await client.post(f"{base_url}/auth/login", data={"username": "investigator@kavach.ai", "password": "admin123"})
        if login_res.status_code != 200:
            print("Failed to login as investigator. Output:", login_res.text)
            return
            
        token = login_res.json()["token"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in successfully.")
        
        print("\n--- SUBMITTING CASE 1 ---")
        case_1 = {
            "scam_type": "OTHER",
            "description": "This is CBI. A parcel linked to your Aadhaar contains illegal substances. Do not tell your family. Transfer Rs 50,000 to secureverify@upi for verification or you will be arrested.",
            "city": "Mumbai"
        }
        res_1 = await client.post(f"{base_url}/cases/", json=case_1, headers=headers)
        print(f"Case 1 Status: {res_1.status_code}")
        if res_1.status_code == 200:
            data_1 = res_1.json()
            case_1_id = data_1.get('id')
            print(f"Created Case ID: {case_1_id}")
            print(f"Risk Score: {data_1.get('risk_score')}")
            print(f"Risk Level: {data_1.get('risk_level')}")
            print(f"Scam Category: {data_1.get('scam_type')}")
        
        print("\n--- SUBMITTING CASE 2 ---")
        case_2 = {
            "scam_type": "OTHER",
            "description": "Pay secureverify@upi immediately or else.",
            "city": "Delhi"
        }
        res_2 = await client.post(f"{base_url}/cases/", json=case_2, headers=headers)
        print(f"Case 2 Status: {res_2.status_code}")
        
        print("\n--- SUBMITTING CASE 3 (BENIGN) ---")
        case_3 = {
            "scam_type": "OTHER",
            "description": "Hey, just checking in to see if you want to get lunch later today.",
            "city": "Chennai"
        }
        res_3 = await client.post(f"{base_url}/cases/", json=case_3, headers=headers)
        print(f"Case 3 Status: {res_3.status_code}")
        if res_3.status_code == 200:
            data_3 = res_3.json()
            print(f"Created Case ID: {data_3.get('id')}")
            print(f"Risk Score: {data_3.get('risk_score')}")
            print(f"Risk Level: {data_3.get('risk_level')}")
        
        print("\n--- CHECKING GRAPH API ---")
        res_graph = await client.get(f"{base_url}/intelligence/graph", headers=headers)
        print(f"Graph Status: {res_graph.status_code}")
        if res_graph.status_code == 200:
            graph_data = res_graph.json()
            nodes = graph_data.get('nodes', [])
            edges = graph_data.get('edges', [])
            print(f"Nodes count: {len(nodes)}")
            print(f"Edges count: {len(edges)}")
            
            # Look for the entity
            entity_id = None
            for n in nodes:
                if n.get('data', {}).get('label') == 'secureverify@upi':
                    entity_id = n.get('data', {}).get('id')
                    print(f"Found shared entity node in Graph: {entity_id}")
                    break
            
            if entity_id:
                # Look for edges connected to this entity
                connected_cases = [e for e in edges if e.get('data', {}).get('target') == entity_id]
                print(f"Graph edges pointing to secureverify@upi: {len(connected_cases)}")

        print("\n--- CHECKING CLUSTER API ---")
        res_cluster = await client.get(f"{base_url}/clusters/", headers=headers)
        print(f"Cluster API Status: {res_cluster.status_code}")
        if res_cluster.status_code == 200:
            clusters = res_cluster.json()
            print(f"Number of clusters: {len(clusters)}")

if __name__ == "__main__":
    asyncio.run(run_api_tests())
