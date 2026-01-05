# Generate Training Data for Forecasting Model

This guide explains how to generate synthetic training data for the XGBoost forecasting model.

## Quick Start

Generate 20,000 training samples (default):

```bash
python generate_forecasting_training_data.py
```

## Command Line Options

```bash
python generate_forecasting_training_data.py --help
```

### Available Options:

- `--samples N`: Target number of data samples (default: 20000)
- `--output-dir DIR`: Output directory for JSON files (default: current directory)
- `--samples-per-file N`: Number of snapshots per JSON file (default: 100)
- `--seed N`: Random seed for reproducibility (default: 42)

## Examples

### Generate 20,000 samples (default):
```bash
python generate_forecasting_training_data.py
```

### Generate 50,000 samples:
```bash
python generate_forecasting_training_data.py --samples 50000
```

### Generate samples in a specific directory:
```bash
python generate_forecasting_training_data.py --output-dir ./training_data
```

### Generate with custom file size:
```bash
python generate_forecasting_training_data.py --samples-per-file 200
```

## Output Format

The script generates multiple JSON files named:
- `forecasting_training_data_0001.json`
- `forecasting_training_data_0002.json`
- etc.

Each file contains an array of farm data snapshots with the following structure:

```json
[
  {
    "timestamp": "2024-01-01T00:00:00",
    "water_quality": [
      {
        "pond_id": 1,
        "ph": 8.0,
        "temperature": 28.5,
        "dissolved_oxygen": 6.2,
        "salinity": 20.0,
        "ammonia": 0.1,
        ...
      }
    ],
    "feed": [
      {
        "pond_id": 1,
        "shrimp_count": 10000,
        "average_weight": 12.5,
        "feed_amount": 450.0,
        ...
      }
    ],
    "energy": [...],
    "labor": [...]
  }
]
```

## Data Characteristics

The generated data includes:

1. **Time Series Progression**: Shrimp weight grows realistically over time
2. **Water Quality Variations**: Realistic variations in pH, temperature, DO, etc.
3. **Seasonal Patterns**: Temperature and other parameters vary seasonally
4. **Realistic Relationships**: 
   - Growth rate affected by water quality
   - Feed adjusted based on conditions
   - Energy usage responds to water quality needs

## Using with the Notebook

The generated data files are automatically detected by the `xgboost_forecasting_model.ipynb` notebook. Simply run:

1. Generate training data:
   ```bash
   python generate_forecasting_training_data.py --samples 20000
   ```

2. Open the notebook and run all cells - it will automatically load the generated data files.

## Notes

- The script uses a random seed (42 by default) for reproducibility
- Data is generated for 4 ponds by default
- Each pond has data spanning multiple days/weeks
- Total samples = (number of ponds) × (days per pond)






