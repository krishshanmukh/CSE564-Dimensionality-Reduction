import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from scipy import stats
from sklearn.metrics import pairwise_distances
from sklearn.manifold import MDS
import numpy as np
import pandas as pd

def getSample(sample):
    if sample == "original":
        return original_sample
    elif sample == "randomized":
        return random_sample
    else:
        return cluster_sample

def do_task1():
    global original_sample
    global random_sample
    global cluster_sample
    data = pd.read_csv('winequalityN.csv')
    data = data.sample(1000)
    data.dropna(inplace=True)
    # Define a dictionary for the target mapping
    target_map = {'white':1, 'red':0}
    # Use the pandas apply method to numerically encode our attrition target variable
    data["type"] = data["type"].apply(lambda x: target_map[x])
    # clustering dataset
    # determine k using elbow method
    original_sample = data

    from sklearn.cluster import KMeans
    from sklearn import metrics
    from scipy.spatial.distance import cdist
    import matplotlib.pyplot as plt
    from sklearn.preprocessing import scale
    X = np.array(scale(data))

    random_sample = data.sample(frac=0.25)
    random_sample.to_csv("random_sample.csv", index=False)

    # Add cluster to the df
    kmeanModel = KMeans(n_clusters=5).fit(X)
    kmeanModel.fit(X)
    data['cluster'] = kmeanModel.fit_predict(X)
    cluster_sample = data
    cluster_sample = cluster_sample.groupby('cluster').apply(lambda x: x.sample(frac=0.25))
    
    cluster_sample.drop(['cluster'], axis=1, inplace=True)
    cluster_sample = cluster_sample.reset_index()
    cluster_sample.drop(['cluster', 'level_1'], axis=1, inplace=True)
    print(cluster_sample)
    cluster_sample.to_csv("cluster_sample.csv", index=False)
    
    data.drop(['cluster'], axis = 1, inplace=True)
    data.to_csv("original_sample.csv", index=False)



def do_pca(data, n_components):
    ''' Get PCA scree plot ka data '''
    my_model = PCA(n_components=n_components)
    my_model.fit_transform(StandardScaler().fit_transform(data))
    data = []
    for x in range(len(my_model.explained_variance_ratio_)):
        data.append({"x":x+1, "y":my_model.explained_variance_ratio_[x], 
        "z":my_model.explained_variance_ratio_.cumsum()[x]})
    return data

# print(my_model.explained_variance_)
    # print(my_model.explained_variance_ratio_)
    # print(my_model.explained_variance_ratio_.cumsum())
def do_pca_2(data, n_components = 2):
    ''' Get PCA scatter plot ka data '''
    my_model = PCA(n_components=n_components)
    X_PCA = my_model.fit_transform(StandardScaler().fit_transform(data))
    data = []
    Xax, Yax = X_PCA[:,0], X_PCA[:,1]
    for x in range(len(Xax)):
        data.append({"x":Xax[x], "y":Yax[x]})
    return data

def scatter_plot_matrix(inp):
    pca = PCA(n_components=5)
    pca.fit(inp)
    loadings = np.sum(np.square(pca.components_), axis = 0)
    data = []
    columns = inp.columns[[loadings.argsort()[-3:][::-1]]]
    temp = inp[columns]
    temp = temp[(np.abs(stats.zscore(temp)) < 4).all(axis=1)]
    for i in range(len(temp[columns[0]])):
        try:

            data.append({columns[0]:temp[columns[0]].iloc[i], columns[1]: temp[columns[1]].iloc[i], columns[2]: temp[columns[2]].iloc[i]})
        except:
            pass
    return data

def mds(inp, met):
    distances = pairwise_distances(StandardScaler().fit_transform(inp), metric=met)
    data = []
    print(inp)
    mds = MDS(n_components=2, dissimilarity="precomputed", random_state=23423)
    d = mds.fit_transform(distances)
    d = d[(np.abs(stats.zscore(d)) < 3).all(axis=1)]
    for p in d:
        data.append({"x":p[0], "y":p[1]})
    return data

#First of all you have to import it from the flask module:
app = Flask(__name__)
#By default, a route only answers to GET requests. You can use the methods argument of the route() decorator to handle different HTTP methods.
@app.route("/", methods = ['POST', 'GET'])
def index():
    #df = pd.read_csv('data.csv').drop('Open', axis=1)
    #The current request method is available by using the method attribute
    if request.method == 'POST':
        # if request.form['data'] == 'received';
        return redirect(request.form['selectControl'] + "/" + request.form['selectControl1'])
    return render_template("index.html")

@app.route("/scree/<sample>", methods = ['POST', 'GET'])
def scree(sample):
    if request.method == 'POST':
        print(sample)
        # if request.form['data'] == 'received';
        return redirect("/" + request.form['selectControl'] + "/" + request.form['selectControl1'])
    data = do_pca(getSample(sample), len(getSample(sample).columns))
    return render_template('scree.html', data=data, selected=["scree", sample])

@app.route("/pca/<sample>", methods = ['POST', 'GET'])
def pca(sample):
    if request.method == 'POST':
        return redirect("/" + request.form['selectControl'] + "/" + request.form['selectControl1'])
    data = do_pca_2(getSample(sample), len(getSample(sample).columns))
    meta_data = {"x_label": "Component 1", "y_label": "Component 2", "title": "Scatter plot - " + sample}
    return render_template('scatter.html', data=data, meta_data = meta_data, selected=["pca", sample])


@app.route("/scattermatrix/<sample>", methods = ['POST', 'GET'])
def scatterplot(sample):
    if request.method == 'POST':
        print(sample)
        # if request.form['data'] == 'received';
        return redirect("/" + request.form['selectControl'] + "/" + request.form['selectControl1'])
    data = scatter_plot_matrix(getSample(sample))
    return render_template('scatter-matrix.html', data=data, selected=["scattermatrix", sample])


@app.route("/mds/<metric>/<sample>", methods = ['POST', 'GET'])
def mdsplot(metric,sample):
    if request.method == 'POST':
        print(sample)
        # if request.form['data'] == 'received';
        return redirect("/" + request.form['selectControl'] + "/" + request.form['selectControl1'])
    meta_data = {"x_label": "Component 1", "y_label": "Component 2", "title": "MDS plot - " + sample}
    if metric == "euclidean":
        data = mds_data_euclidean[sample]
    else:
        data = mds_data_correlation[sample]
    return render_template('mds.html', data=data, meta_data = meta_data, plot=metric, selected=["mds/"+metric, sample])


if __name__ == "__main__":
    do_task1()
    # original_sample = pd.read_csv('original_sample.csv')
    # # original_sample.drop(original_sample.columns[0], inplace=True, axis=1)
    # cluster_sample = pd.read_csv('cluster_sample.csv')
    # # cluster_sample.drop(cluster_sample.columns[[0,1,52]], inplace=True, axis=1)
    # random_sample = pd.read_csv('random_sample.csv')
    mds_data_correlation = {}
    mds_data_euclidean = {}
    mds_data_correlation["original"] = mds(original_sample, "correlation")
    mds_data_correlation["stratified"] = mds(cluster_sample, "correlation")
    mds_data_correlation["randomized"] = mds(random_sample, "correlation")
    mds_data_euclidean["original"] = mds(original_sample, "euclidean")
    mds_data_euclidean["stratified"] = mds(cluster_sample, "euclidean")
    mds_data_euclidean["randomized"] = mds(random_sample, "euclidean")
    # random_sample.drop(random_sample.columns[0], inplace=True, axis=1)
    app.run(debug=True)
