import os
import requests
import time
import random
import threading
from perlin_noise import PerlinNoise

sensor_configs = {
    "sensor1": { "duration": [ 0.5, 0.6 ], "value_midlevel": 0.0, "value_range": 1.0, "noise_scale": 0.35 },
    "sensor2": { "duration": [ 1.0, 1.5 ], "value_midlevel": 0.0, "value_range": 1.0, "noise_scale": 0.2 },
    "sensor3": { "duration": [ 0.4, 0.9 ], "value_midlevel": 0.0, "value_range": 1.0, "noise_scale": 0.4 }
}

def run_sensor(sensor_name):
    # Initialize sensor
    cfg = sensor_configs[sensor_name]
    start_time = time.time()
    noise = PerlinNoise(seed=hash(sensor_name))
    sensor_data = 0

    while True:
        # Update sensor data
        t = (time.time() - start_time) * cfg["noise_scale"]
        sensor_data = cfg["value_midlevel"] + cfg["value_range"] * noise(t) + random.uniform(-0.04, 0.04)
        print(t, sensor_name, sensor_data)

        # Try send sensor data
        try:
            requests.post(os.environ.get("API_URL") + "sensor-data", json={
                "sensor_name": sensor_name,
                "sensor_data": sensor_data
            })
        except:
            print("Could not send data for '" + sensor_name + "'")

        # Update and sleep
        last_update = time.time()
        r = cfg["duration"]
        time.sleep(random.uniform(r[0], r[1]))

if __name__ == "__main__":
    # Start a new thread for each sensor
    for sensor_name in sensor_configs:
        threading.Thread(target=run_sensor, args=(sensor_name,)).start()
