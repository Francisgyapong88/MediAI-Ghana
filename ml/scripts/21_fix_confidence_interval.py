import math

n = 96
correct = 96
accuracy = correct / n

# Wilson score interval - the standard, defensible method for proportions
# near 0 or 1, unlike the naive Wald interval which breaks down here
z = 1.96  # 95% confidence
denominator = 1 + z**2 / n
center = (accuracy + z**2 / (2*n)) / denominator
margin = (z * math.sqrt((accuracy * (1 - accuracy) / n) + (z**2 / (4 * n**2)))) / denominator

ci_low = max(0, center - margin)
ci_high = min(1, center + margin)

print(f"Accuracy: {accuracy:.4f}")
print(f"95% Wilson score CI: [{ci_low:.4f}, {ci_high:.4f}]")