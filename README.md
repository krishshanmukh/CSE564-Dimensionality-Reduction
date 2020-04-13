# CSE564-Dimensionality-Reduction
Three basic tasks of visualization - Part of CSE 564 (Visualization) course

## Technologies
* python-flask
* d3 js

## Requirements
1. data clustering and decimation (30 points)
    * implement random sampling and stratified sampling (remove 75% of data)
    * the latter includes the need for k-means clustering (optimize k using elbow)
2. dimension reduction on both org and 2 types of reduced data (30)
    * find the intrinsic dimensionality of the data using PCA
    * produce scree plot visualization and mark the intrinsic dimensionality
    * show the scree plots before/after sampling to assess the bias introduced
    * obtain the three attributes with highest PCA loadings
3. visualization of both original and 2 types of reduced data (40 points)
    * visualize the data projected into the top two PCA vectors via 2D scatterplot
    * visualize the data via MDS (Euclidian & correlation distance) in 2D scatterplots
    * visualize the scatterplot matrix of the three highest PCA loaded attributes

## To run
```
pip install -r requirements.txt
python app.py
```

## Dataset
[Red Wine Quality Dataset](https://www.kaggle.com/rajyellow46/wine-quality)
