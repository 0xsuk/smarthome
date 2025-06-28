import time

lines = [
    "A full buffer was not returned. Try again.",
    "Checksum did not validate. Try again.",
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.6", 
    "A full buffer was not returned. Try again.",
    "A full buffer was not returned. Try again.",
    "temp=25.2 humidity=66.6", 
    "temp=25.2 humidity=66.7", 
    "temp=25.2 humidity=66.7", 
]

while True:
    for line in lines:
        print(line)
        time.sleep(2)  # 2 seconds delay between each line
