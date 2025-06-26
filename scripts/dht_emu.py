import time

lines = [
    "A full buffer was not returned. Try again.",
    "Checksum did not validate. Try again.",
    "Temp: 77.4 F / 25.2 C    Humidity: 66.6%", 
    "Temp: 77.2 F / 25.1 C    Humidity: 66.7%", 
    "Temp: 77.2 F / 25.1 C    Humidity: 66.7%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.7%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.7%", 
    "A full buffer was not returned. Try again.",
    "A full buffer was not returned. Try again.",
    "Temp: 77.4 F / 25.2 C    Humidity: 66.7%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.7%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.8%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.8%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.8%", 
    "Temp: 77.4 F / 25.2 C    Humidity: 66.9%", 
]

while True:
    for line in lines:
        print(line)
        time.sleep(2)  # 2 seconds delay between each line
