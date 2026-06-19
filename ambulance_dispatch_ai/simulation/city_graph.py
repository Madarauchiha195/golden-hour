import networkx as nx
import numpy as np
import random
import pickle
import os

SIM_DIR = "ambulance_dispatch_ai/simulation/"
os.makedirs(SIM_DIR, exist_ok=True)

class DigitalTwinSimulator:
    def __init__(self, grid_size=20):
        self.grid_size = grid_size
        self.graph = nx.grid_2d_graph(grid_size, grid_size)
        
        # Add baseline weights (travel time in seconds) to edges
        for (u, v) in self.graph.edges():
            self.graph.edges[u, v]['weight'] = random.randint(30, 90)
            self.graph.edges[u, v]['base_weight'] = self.graph.edges[u, v]['weight']
            
        # Spawn Hospitals
        self.hospitals = self._spawn_entities(num=5)
        # Spawn Ambulances
        self.ambulances = self._spawn_entities(num=20)
        
    def _spawn_entities(self, num):
        nodes = list(self.graph.nodes())
        return random.sample(nodes, num)

    def generate_live_traffic(self):
        """Simulate dynamic traffic conditions over the network."""
        for (u, v) in self.graph.edges():
            # 10% chance of high congestion
            if random.random() < 0.10:
                self.graph.edges[u, v]['weight'] = self.graph.edges[u, v]['base_weight'] * random.uniform(3.0, 5.0)
            else:
                self.graph.edges[u, v]['weight'] = self.graph.edges[u, v]['base_weight'] * random.uniform(0.8, 1.2)
                
    def get_fastest_route(self, source, target):
        """Finds the fastest route using Dijkstra's algorithm over live traffic."""
        try:
            path = nx.shortest_path(self.graph, source=source, target=target, weight='weight')
            length = nx.shortest_path_length(self.graph, source=source, target=target, weight='weight')
            return path, length
        except nx.NetworkXNoPath:
            return None, float('inf')

    def save(self):
        with open(os.path.join(SIM_DIR, 'city_graph.pkl'), 'wb') as f:
            pickle.dump(self, f)

if __name__ == "__main__":
    print("Initializing City Digital Twin...")
    twin = DigitalTwinSimulator(grid_size=20)
    twin.generate_live_traffic()
    twin.save()
    print(f"Spawned 5 Hospitals and 20 Ambulances across {twin.grid_size}x{twin.grid_size} grid.")
