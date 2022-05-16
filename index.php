<!Doctype html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/bootstrap4/css/bootstrap.min.css">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <style>
        body {
            background-color: #eee;
        }

        .jumbotron {
            padding: 20px;
            background-color: #dfdfdf;
        }

        .row {
            padding-bottom: 20px;
        }

        .modal {
            position: fixed;
            height: 100vh;
            width: 100vw;
            background-color: #333333aa;
            display: block;
        }

        .td{
            text-shadow: 0 0 5px #fff;
        }

        .table-responsive{
            background-color: #eeeeee88;
            box-shadow: 2px 2px 5px #333, -2px -2px 5px #ccc;
            padding: 5px;
        }

        .close-modal{
            padding:10px;
            margin-right: 30px;
            float:right;font-size:2em;color:red;cursor:pointer;
            text-shadow: 2px 2px 2px #fff, -1px -1px 2px #888;
        }

        .sp2{
            animation-delay: 150ms;
        }

        .sp3{
            animation-delay: 300ms;
        }
    </style>
</head>

<body>
    <div class='container container-fluid'>
        <div class='row'>
            <div class='col-md-12'>
                <div class='jumbotron'>
                    <p class='title text-center display-6'>Generate Report From The CSV files</p>
                </div>
            </div>
        </div>

        <div class='row'>
            <br>
            <div class='col-md-8 offset-2'>
                <form>
                    <br>
                    <input webkitdirectory title="Select File Path" multiple id='files' onchange="fileSelectionObserver(this)" class='form-control' type='file' name='files' accept="text/csv">
                    
                </form>
            </div>
        </div>

        <div class='row'>
            <div class='col-md-8 offset-2 d-none machine'>
                <div class='row'>
                    <div class='display-6'>Generate Report</div>
                    <div class='col-sm-4'><label for='from'>From: </label>&nbsp;&nbsp;&nbsp;&nbsp;<input class='form-control' type='date' name='from' date></div>
                    <div class='offset-4 col-sm-4'><label for='from'>To: </label>&nbsp;&nbsp;&nbsp;&nbsp;<input class='form-control' type='date' name='to' date></div>
                </div><br>
                <label for='filter'>Take average of: <span id='agg-val'>5</span>min</label>
                <input name='filter' type='range' min=1 max=120 style='width:100%;height:2em' oninput="document.getElementById('agg-val').innerHTML = this.value" value=5>
                <nav class="alert alert-primary">
                    <div class="" href="#">&nbsp;&nbsp;Select Machine: &nbsp;&nbsp;&nbsp;<span id='sel-mac' class='dispaly-4 text-center'></span> </div>
                </nav>

                <br>
                <div class='d-flex justify-content-center'>
                    <button class='btn btn-md btn-primary starter' onclick='run()'>Process</button>
                </div>
            </div>
        </div>
    </div>

    <div class='modal d-none'>
        <div style='height:5vh;width:100vw'><span class='close-modal d-none' onclick='closeModal()'>X</span></div>
        <div class="row loader">
            <div class="col-md-4 offset-4 text-center">
                <div class="spinner-grow spinner-grow-xl text-info" style="width: 5rem; height: 5rem;" role="status"></div>
                <div class="spinner-grow spinner-grow-xl text-info sp2" style="width: 5rem; height: 5rem;" role="status"></div>
                <div class="spinner-grow spinner-grow-xl text-info sp3" style="width: 5rem; height: 5rem;" role="status"></div>
            </div>
            <div class='col-md-12 text-center'>
                <span class='display-4 td'>Processing....</span>
            </div>
        </div>
        <div class='row cs d-none'>
            <div class='col-md-4 offset-4 text-center'>
                <div class="alert alert-success display-6">
                    Processing Complete.
                </div>
            </div>
        </div>
        <div class='row'>
            <div class='col-md-8 offset-2'>
                <div class='table-responsive'>
                    <table class='table table-striped'>
                        <thead>
                            <th scope='col'>#</th>
                            <th scope='col'>File Being Processed</th>
                            <th scope='col'>No. of files Processed</th>
                            <th scope='col'>Progress</th>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                    <button class="btn btn-sm btn-primary d-flex justify-content-center" onclick="stop()">Stop Processing</button>
                </div>
            </div>
        </div>
    </div>
    <div class='download-list'></div>
</body>
<script src='script.js'></script>

</html>