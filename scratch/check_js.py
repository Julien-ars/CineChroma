with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's inspect functions and structure
# Let's look around line 3100 to 3500
lines = code.split('\n')
print(f"Total lines: {len(lines)}")

# Simple parser for JS braces
stack = []
in_str = None
in_comment = False
in_multiline_str = False

i = 0
line_no = 1
col_no = 1

while i < len(code):
    ch = code[i]
    if ch == '\n':
        line_no += 1
        col_no = 1
        i += 1
        continue
    
    if in_comment:
        if ch == '*' and i + 1 < len(code) and code[i+1] == '/':
            in_comment = False
            i += 2
            col_no += 2
            continue
        i += 1
        col_no += 1
        continue
        
    if in_str:
        if ch == '\\':
            i += 2
            col_no += 2
            continue
        if ch == in_str:
            in_str = None
        i += 1
        col_no += 1
        continue
        
    # Check start of regex or comment
    if ch == '/' and i + 1 < len(code):
        if code[i+1] == '/':
            # skip till end of line
            while i < len(code) and code[i] != '\n':
                i += 1
            continue
        elif code[i+1] == '*':
            in_comment = True
            i += 2
            col_no += 2
            continue
        elif i > 0 and code[i-1] in '=(:,;![{':
            # regex literal
            i += 1
            col_no += 1
            while i < len(code) and code[i] != '/':
                if code[i] == '\\':
                    i += 2
                    col_no += 2
                else:
                    i += 1
                    col_no += 1
            i += 1
            col_no += 1
            while i < len(code) and code[i] in 'gimsuy':
                i += 1
                col_no += 1
            continue
            
    # Check start of string
    if ch in ("'", '"', '`'):
        in_str = ch
        i += 1
        col_no += 1
        continue
        
    if ch in '{[(':
        stack.append((ch, line_no, col_no))
    elif ch in '}])':
        if not stack:
            print(f"Extra closing {ch} at {line_no}:{col_no}")
        else:
            last, l_no, c_no = stack.pop()
            expected = {'{': '}', '[': ']', '(': ')'}[last]
            if ch != expected:
                print(f"Mismatched {ch} at {line_no}:{col_no}, expected {expected} from {l_no}:{c_no}")
    
    i += 1
    col_no += 1

if stack:
    print(f"Total unclosed: {len(stack)}")
    for item in stack:
        print(f"  Unclosed {item[0]} at line {item[1]}:{item[2]}")
        # Print the line content
        print(f"    Line content: {lines[item[1]-1]}")
else:
    print("ALL BRACKETS/BRACES/PARENS BALANCED!")
