import re

c = open("data.js").read()

# Remove the garbage: ], "correct": 1, "explanation": "NICE/AAP..." followed by old MCQ items
# Find the end of pick_mistakes array and remove everything until matching_sets
pattern = r'(\],"pick_mistakes":\[.*?\])\s*,\s*"correct"\s*:.*?("matching_sets")'
result = re.sub(pattern, r'\1,\2', c, flags=re.S)

if result != c:
    open("data.js", "w").write(result)
    print("Fixed garbage data")
else:
    # Alternative: find the garbage manually
    marker = '"pick_mistakes":'
    pm_start = c.find(marker)
    if pm_start == -1:
        print("ERROR: pick_mistakes not found"); exit()
    
    # Find closing ] of pick_mistakes array
    bracket_start = c.find('[', pm_start)
    depth = 0
    pm_end = bracket_start
    for i in range(bracket_start, len(c)):
        if c[i] == '[': depth += 1
        elif c[i] == ']':
            depth -= 1
            if depth == 0:
                pm_end = i
                break
    
    # Find next key after pick_mistakes
    next_key = c.find('"matching_sets"', pm_end)
    if next_key == -1:
        next_key = c.find('"action_cards"', pm_end)
    
    if next_key > pm_end:
        garbage = c[pm_end+1:next_key]
        print("Garbage found:", repr(garbage[:80]))
        cleaned = c[:pm_end+1] + ',' + c[next_key:]
        open("data.js", "w").write(cleaned)
        print("Fixed!")
    else:
        print("No garbage found")
