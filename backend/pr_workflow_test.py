def calculate_average(numbers):
    if not numbers:
        return 0

    return sum(numbers) / len(numbers)


numbers = [10, 20, 30, 40, 50]

average = calculate_average(numbers)

print(f"Numbers: {numbers}")
print(f"Average: {average}")