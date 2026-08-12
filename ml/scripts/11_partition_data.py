import pandas as pd

df = pd.read_csv("data/subset_with_groups.csv")

train_rows, val_rows, test_rows = [], [], []
partition_report = []

for disease in sorted(df["Disease"].unique()):
    disease_df = df[df["Disease"] == disease]

    # Get each group's size for this disease, largest first
    # (placing big groups first makes the packing more predictable)
    group_sizes = disease_df.groupby("group_id").size().sort_values(ascending=False)
    total = group_sizes.sum()
    target_train, target_val, target_test = total * 0.6, total * 0.2, total * 0.2

    train_count = val_count = test_count = 0
    assignment = {}

    for group_id, size in group_sizes.items():
        # Assign each group to whichever partition is furthest below its target
        train_gap = target_train - train_count
        val_gap = target_val - val_count
        test_gap = target_test - test_count
        best = max([("train", train_gap), ("val", val_gap), ("test", test_gap)], key=lambda x: x[1])[0]

        assignment[group_id] = best
        if best == "train":
            train_count += size
        elif best == "val":
            val_count += size
        else:
            test_count += size

    for _, row in disease_df.iterrows():
        target = assignment[row["group_id"]]
        if target == "train":
            train_rows.append(row)
        elif target == "val":
            val_rows.append(row)
        else:
            test_rows.append(row)

    partition_report.append({
        "Disease": disease, "Groups": len(group_sizes),
        "Train rows": train_count, "Val rows": val_count, "Test rows": test_count,
        "Train %": round(100*train_count/total,1), "Val %": round(100*val_count/total,1), "Test %": round(100*test_count/total,1)
    })

train_df = pd.DataFrame(train_rows)
val_df = pd.DataFrame(val_rows)
test_df = pd.DataFrame(test_rows)

print(pd.DataFrame(partition_report).to_string(index=False))
print()
print("TOTALS -> Train:", len(train_df), " Val:", len(val_df), " Test:", len(test_df), " (sum:", len(train_df)+len(val_df)+len(test_df), ")")

# Critical leakage check: no group_id should appear in more than one partition
train_groups = set(train_df["group_id"])
val_groups = set(val_df["group_id"])
test_groups = set(test_df["group_id"])
overlap = (train_groups & val_groups) | (train_groups & test_groups) | (val_groups & test_groups)
print()
print("Cross-partition duplicate signature groups (should be 0):", len(overlap))
print()
print("Distinct signature groups per partition:")
print("  Train:", len(train_groups))
print("  Val:", len(val_groups))
print("  Test:", len(test_groups))

train_df.to_csv("data/train.csv", index=False)
val_df.to_csv("data/val.csv", index=False)
test_df.to_csv("data/test.csv", index=False)
print()
print("Saved data/train.csv, data/val.csv, data/test.csv")