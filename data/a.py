import json

# JSONファイルを読み込む
with open('code.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
def calc_mode(values):
    # Count frequency of each value
    freq = {}
    for val in values:
        freq[val] = freq.get(val, 0) + 1
    
    # Find the value(s) with maximum frequency
    max_freq = max(freq.values())
    modes = [k for k, v in freq.items() if v == max_freq]
    
    return modes[0] if len(modes) == 1 else modes

#T = calc_mode(list)
T = 530

def handle_list(list):
    result = ""
    for num in range(0, len(list), 2):
        if (num+1 >= len(list)):
            result += "?"
            break

        first = list[num]
        first_T = round(first / T)
        second = list[num+1]
        second_T = round(second / T)
        if (first_T==1 and second_T==1):
            result += "0"
        elif (first_T==1 and second_T==3):
            result += "1"
        elif (first_T==8 and second_T==8):
            result += "$"
        elif (first_T==1 and second_T==8):
            result += "?"
        else:
            result += f"error, {first_T} {second_T}"
    return result

def main():
    # 各プロパティ(キー)について処理
    for key in data:
        print(f'{key}:')
        value_list = data[key]
        result_string = handle_list(value_list)
        
        # 最初の文字を除いて、4文字ずつ空白区切りでプリント
        if len(result_string) > 1:
            j=0
            remaining = result_string[1:]  # 最初の文字を除く
            for i in range(0, len(remaining), 4):
                j+=1
                if j==19:
                    chunk = remaining[i:i+2]
                    print(chunk, end=" ")
                    i-=2
                else:
                    chunk = remaining[i:i+4]
                    
                    if chunk.isdigit():
                        print(chunk, end=" ")
                        continue
                    print(chunk, end=" ")
        print()  # 最後に改行

if __name__ == '__main__':
    main()