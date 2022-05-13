<!Doctype html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/vendor/twitter/bootstrap/dist/css/bootstrap.min.css">
    <script src='/vendor/twitter/bootstrap/dist/js/bootstrap.min.js'></script>
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
            background-color: #33333388;
            display: block;
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
                    <input id='files' onchange="fileSelectionObserver(this)" class='form-control' type='file' name='files' accept="text/csv">
                </form>
            </div>
        </div>

        <div class='row'>
            <div class='col-md-8 offset-2 d-none machine'>
                <label for='filter'>Take average of: <span id='agg-val'>5</span>min</label>
                <input name='filter' type='range' min=1 max=120 style='width:100%;height:2em' oninput="document.getElementById('agg-val').innerHTML = this.value" value=5>
                <nav class="alert alert-primary">
                    <span class="navbar-brand" href="#">&nbsp;&nbsp;Selected Machine:</span><br>
                    <div id='sel-mac' class='dispaly-6 text-center'></div>
                </nav>

                <br>
                <div class='d-flex justify-content-center'>
                    <button class='btn btn-sm btn-primary' onclick='process()'>Process</button>
                </div>
            </div>
        </div>
    </div>

    <div class='modal d-none'>
        <div style='height:20vh;width:100vw'>&nbsp;</div>
        <div class="row">
            <div class="col-md-4 offset-4 text-center">
                <div class="spinner-grow spinner-grow-xl text-info" style="width: 5rem; height: 5rem;" role="status"></div>
                <div class="spinner-grow spinner-grow-xl text-info" style="width: 5rem; height: 5rem;" role="status"></div>
                <div class="spinner-grow spinner-grow-xl text-info" style="width: 5rem; height: 5rem;" role="status"></div>
                <br>
                <span class='display-4'>Processing....</span><span id='centage'>0%</span>
            </div>
        </div>
    </div>
</body>
<script>
    var active_machines = [];
    var pm3_headers = 'Date,Time,A400 Circuit Status,A270 Circuit Status,PM-03 Device Status,BC-82 Device Status,PM-03 Sound Control FB,PM-03 Sound Control SP,PM-03 Sound Control CV,BC-82 Speed SP,PM-03 Sound Control Enable,BE-15 Amps';

    function fileSelectionObserver(input) {
        if (input.files.length > 0) {
            document.querySelector('.machine').classList.remove('d-none');
        } else {
            document.querySelector('.machine').classList.add('d-none');
            active_machines = [];
            return;
        }
        let machine = [];
        for (let file of input.files) {
            let name = file.name.split('_')[0];
            machine.push(name)
        }
        machine = [...new Set(machine)]
        active_machines = machine

        let sel_lbl = document.getElementById('sel-mac');
        sel_lbl.innerHTML = '';
        for (let m of machine) {
            sel_lbl.innerHTML += `<span class='badge badge-info'>${m}</span>`;
        }
    }

    function parseCSVToJSON(text, omitFirstRow = false) {
        return text.slice(omitFirstRow ? csv.indexOf('\n') + 1 : 0)
            .split("\n")
            .map((element) => element.split(','));
    }

    function createTimeStampedDict(data) {
        let data_dict = {}
        let timestamps = []
        let max = 0;
        let min = 100000000000;
        for (let d of data) {
            time = new Date(d[0] + " " + d[1]);
            if (!time || isNaN(time)) break;
            time = parseInt(time.getTime() / 1000);
            if (min > time) min = time;
            if (time > max) max = time;
            timestamps.push(time)
            data_dict[time] = d
        }
        timestamps.sort();
        return [data_dict, timestamps, max, min];
    }

    function arrayToCSV(arr, delimiter = ',') {
        return arr.map(v => v.map(x => `"${x}"`).join(delimiter)).join('\n');
    }

    function process() {
        document.querySelector('.modal').classList.toggle('d-none')
        let progress = document.getElementById('centage');
        let current_file;
        let input = document.getElementById('files');
        let reader = new FileReader();

        reader.addEventListener('load', (event) => {
            var result = event.target.result;
            let max, min, timestamps;
            [result, timestamps, max, min] = createTimeStampedDict(parseCSVToJSON(result))
            let outputFilename = current_file + "_outputfile.csv";
            // console.log(outputFilename)
            let filter = document.querySelector('[name=filter]').value * 60;
            // console.log(filter);

            let output = [pm3_headers.split(',')];
            let current_stamp = timestamps[0];
            let row = result[current_stamp];
            let end_time = row[1];
            for (let t = 1; t < timestamps.length; t++) {
                let diff = timestamps[t] - current_stamp;
                // console.log(diff, timestamps[t], timestamps[t] > current_stamp)
                progress.innerHTML = (t / timestamps.length) * 100 + "%"
                if (diff < filter) {
                    for (let i = 2; i < row.length; i++) {
                        row[i] = parseInt(row[i]) + parseInt(result[timestamps[t]][i]);
                    }
                    end_time = result[timestamps[t]][1]
                } else {
                    row[1] += " - " + end_time;
                    output.push(row);
                    current_stamp = timestamps[t];
                    row = result[current_stamp];
                    end_time = row[1];
                }
            }
            row[1] += " - " + end_time;
            output.push(row);
            console.log(output.length)

            let csv_string = arrayToCSV(output)

            document.querySelector('.modal').classList.toggle('d-none')

            downloadCSV(csv_string,outputFilename)
        });

        // reader.addEventListener('progress', (event) => {
        //     if (event.loaded && event.total) {
        //         const percent = (event.loaded / event.total) * 100;
        //         console.log(`Progress: ${Math.round(percent)}`);
        //     }
        // });
        for (const f of input.files) {
            current_file = f.name.split('.')[0];
            reader.readAsText(f);
        }
    }

    function downloadCSV(csv, filename) {
        var csvFile;
        var downloadLink;

        // CSV file
        csvFile = new Blob([csv], {
            type: "text/csv"
        });

        // Download link
        downloadLink = document.createElement("a");

        // File name
        downloadLink.download = filename;

        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);

        // Hide download link
        downloadLink.style.display = "none";

        // Add the link to DOM
        document.body.appendChild(downloadLink);

        // Click download link
        downloadLink.click();
    }
</script>

</html>