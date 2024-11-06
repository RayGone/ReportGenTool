<!Doctype html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tool</title>
    <link rel='icon' type='image/png' href='c_logo.png'>
    <link rel="stylesheet" href="scripts/bootstrap4.min.css"> 
    <link rel="stylesheet" href="scripts/bootstrap5.min.css"> 
    <link rel='stylesheet' href='scripts/custom.css'>
</head>

<body>
    <div class='container-fluid'>
        <div class='row'>
            <div class='col-md-10 offset-md-1'>
                <div class='jumbotron'>
                    <br>
                    <div class="row">
                        <div class='col-md-2'><img src='c_logo.png' style='height:50px;width:50px;'></div>
                        <div class='col-md-8'>
                            <p class='title text-center display-6'>Covia's Report Generation Tool</p>
                        </div>
                    </div>

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
                    <div class='col-sm-3'><label for='from'>From: </label>&nbsp;&nbsp;&nbsp;&nbsp;<input class='form-control' type='date' name='from' date></div>
                    <div class='offset-1 col-sm-3'><label for='from'>To: </label>&nbsp;&nbsp;&nbsp;&nbsp;<input class='form-control' type='date' name='to' date></div>
                </div><br>
                <label for='filter'>Take average of: <span id='agg-val'>5min</span></label>
                <div class="wrap">
                    <input name='filter' type='range' min=1 max=7200 style='width:100%;height:2em' oninput="updateDateRangeLabel(this)" value=300>
                </div>
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
                &nbsp;&nbsp;<div class="spinner-grow spinner-grow-xl text-info sp2" style="width: 5rem; height: 5rem;" role="status"></div>
                &nbsp;&nbsp;<div class="spinner-grow spinner-grow-xl text-info sp3" style="width: 5rem; height: 5rem;" role="status"></div>
            </div>
            <div class='col-md-12 text-center'>
                <span class='display-4 td'>Processing....</span>
            </div>
        </div>
        <div class='row cs d-none'>
            <div class='col-md-4 offset-4 text-center'>
                <div class="alert alert-primary display-6">
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
<script src='scripts/script.js'></script>

</html>