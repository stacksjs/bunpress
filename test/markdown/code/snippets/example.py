# Sample Python file for code import testing
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

# region calculations
def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Division by zero")
    return a / b
# endregion

def subtract(a, b):
    return a - b
