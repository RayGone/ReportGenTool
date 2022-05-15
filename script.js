var available_machines = [];
var active_machine;
var semaphore = 0;

function getHeaders(machine_id) {
    var pm3_headers = 'Date,Time,A400 Circuit Status,A270 Circuit Status,PM-03 Device Status,BC-82 Device Status,PM-03 Sound Control FB,PM-03 Sound Control SP,PM-03 Sound Control CV,BC-82 Speed SP,PM-03 Sound Control Enable,BE-15 Amps\n';
    var pm4_headers = `,,Main Parameters,,,,,,,,,,,,,,,Mill Parameters,,,,,,Fan Parameters,,,,,,,,,Classifier Parameters,,,,,\nDate,Time,PM-04 System total Air Flow % of Max,"ATP Secondary Airflow, % of Max",FI-OX DP,PM-04 Mill Motor Current %,PM-04 Feed Side Bearing Temp,PM-04 Outlet Side Bearing Temp,CW-01 %,CW-02 %,CW-03 %,CW-04 %,CW-05 %,CW-06 %,PM-04 Mill Weight,BC-84 Feed Rate,,Mill Main Drive motor Bearing 1 temp.,Mill Main Drive motor Bearing 2 temp.,Header Compressed Air Airflow Fdbk (CFM),Header Compressed Air Pressure Fdbk (PSI),Minex 4 Filter Compressed Air Pressure Fdbk (PSI),,Fan Bearing Temp. 1,Fan Bearing Temp. 2,Fan Bearing 1 Vib. ,Fan Bearing 2 Vib. ,Blower Motor Current %,FA-41 U Winding Temp,FA-41 V Winding Temp,FA-41 W Winding Temp,,CW-01 RPM,CW-02 RPM,CW-03 RPM,CW-04 RPM,CW-05 RPM,CW-06 RPM\n`;
    var pm5_headers = `,,Main Parameters,,,,,,,,,,,,,,,Mill Parameters,,,,,,Fan Parameters,,,,,,Classifier Parameters,,,,,,\nDate,Time,FA-48 Primary Air Velocity (% of Max Primary),AS-05 Secondary Air Velocity (% of Max Primary),FI-O3 DP,PM-05 Mill Motor Current %,PM-05 Feed Side Bearing Temp,PM-05 Outlet Side Bearing Temp,CW-07 %,CW-08 %,CW-09 %,CW-10 %,CW-11 %,CW-12 %,PM-05 Mill Weight,BC-86 Feed Rate Scaled ,,PM-05 Header Compressed Air Pressure Fdbk (PSI),MX-4 Filter Compressed Air Pressure Fdbk (PSI),AC-05 Header Compressed Airflow Fdbk (CFM),BN-19 Level Fdbk %,Power Factor,,FA-48 Drive Bearing Temp,FA-48 Non-Drive Bearing Temp,FA-48 Drive Bearing Vibration,FA-48 Non-Drive Bearing Vibration,FA-48 System Fan Motor Current (%),,CW-07 RPM,CW-08 RPM,CW-09 RPM,CW-10 RPM,CW-11 RPM,CW-12 RPM,Classifier Speed Setpoint\n`;
    var pm6_headers = 'Date,Time,AS-06 Flow %,FA-54 Amps %,FA-54 Flow %,FI-04 DP,FA-54 Drive Bearing Temp,FA-54 Non-Drive Bearing Temp,PM-06 Feed Side Bearing Temp,PM-06 Outlet Side Bearing Temp,CW-13 %,CW-14 %,CW-15 %,CW-16 %,CW-17 %,CW-18 %,,,PM-06 Amps %,FA-54 Speed %,FA-54 Drive Bearing Vibration,FA-54 Non-Drive Bearing Vibration,FA-54 Primary Flow SP,FA-54 Primary Flow FB,PM-06 U Winding Temp,PM-06 V Winding Temp,PM-06 W Winding Temp,PM-06 Drive Side Bearing Temp,PM-06 Non-Drive Side Bearing Temp,FA-54 U Winding Temp,FA-54 V Winding Temp,FA-54 W Winding Temp,FA-54 Drive Side Bearing Temp,FA-54 Non-Drive Side Bearing Temp,LU-06 Grease Pump Enabled,LU-06 Grease Pump Run Status,LU-06 Grease Pump System Fault Status,LU-06 Grease Pump Min Since Last Cycle,LU-06 Grease Pump Run Time (Min),BC-88 TPH FB,BC-88 TPH SP,BC-88 Speed %,PM-06 Amps,FA-54 Amps,SI-23 Tons,PM-06 Tons SP,CW-13 RPM,CW-14 RPM,CW-15 RPM,CW-16 RPM,CW-17 RPM,CW-18 RPM,CW-13 Power FB,CW-14 Power FB,CW-15 Power FB,CW-16 Power FB,CW-17 Power FB,CW-18 Power FB,BC-88 Feed Rate,BC-88 Feed Rate By SI-23 Weight\n';
    
    switch (machine_id) {
        case 'PM03':
            return pm3_headers;
        case 'PM04':
            return pm4_headers;
        case 'PM05':
            return pm5_headers;
        case 'PM06':
            return pm6_headers;
        default:
            return '';
    }
}

function checkRemoveHeaders(data = []) {
    let d_len = data.length;
    if(d_len > 0){
        while(true){
            let crow = data[0];
            let dt = new Date(crow[0]);
            if(isNaN(dt)){
                data.shift();
            }else{
                break;
            }
        }
        return data;
    }
    return [];
}

function fileSelectionObserver(input) {
    if (input.files.length > 0) {
        document.querySelector('.machine').classList.remove('d-none');
    } else {
        document.querySelector('.machine').classList.add('d-none');
        available_machines = [];
        return;
    }
    let max_date = '';
    let min_date = '';
    for (let file of input.files) {
        let sp = file.name.split('_');
        let name = sp[0];
        let date = sp[1];
        if(!(max_date && min_date)) max_date = min_date = date;
        else{
            if(date > max_date) max_date = date;
            if(date<min_date) min_date = date;
        }
        if(!available_machines.some( m => m==name ))
            available_machines.push(name)
    }

    function fileDateParser(dateString){
        let year =  dateString.substr(0,4);
        let month = dateString.length == 7 ? "0"+dateString.substr(4,1) : dateString.substr(4,2);
        let date = dateString.length == 7 ? dateString.substr(5,2) : dateString.substr(6,2)
        return `${year}-${month}-${date}`;
    }

    document.querySelectorAll('[date]').forEach(elm => {
        elm.max = fileDateParser(max_date);
        elm.min = fileDateParser(min_date);
        if(available_machines.length == 1) elm.value = elm.max;
    });

    let sel_lbl = document.getElementById('sel-mac');
    sel_lbl.innerHTML = '';

    for (let m of available_machines) {
        sel_lbl.innerHTML += `<span class='btn btn-sm btn-primary btn-m display-4 m-3' onclick="selectMachine(this)">${m}</span>`;
    }
    if(available_machines.length > 1)
        sel_lbl.innerHTML += `<span class='btn btn-sm btn-primary btn-m display-4 m-3' onclick="selectMachine(this)">ALL</span>`;

}

function selectMachine(selected){
    let sm = document.querySelectorAll('.btn-m');
    for(let btn of sm){
        if(btn.innerHTML == selected.innerHTML){
            btn.classList.add('active');
            btn.classList.remove('btn-primary')
            btn.classList.add('btn-success')
            active_machine = selected.innerHTML;
        }else{
            btn.classList.remove('active')
            btn.classList.add('btn-primary')
            btn.classList.remove('btn-success')
        }
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
        // if (min > time) min = time;
        // if (time > max) max = time;
        timestamps.push(time)
        data_dict[time] = d
    }
    timestamps.sort();
    return [data_dict, timestamps];//, max, min];
}

function arrayToCSV(arr, delimiter = ',') {
    return arr.map(v => v.map(x => `"${x}"`).join(delimiter)).join('\n');
}

function process(fObject, machine_id, pid) {
    let p_el = document.getElementById(pid);
    document.querySelector('.modal').classList.toggle('d-none')

    let current_file;
    let reader = new FileReader();

    reader.addEventListener('load', (event) => {
        let filter = document.querySelector('[name=filter]').value * 60;
        var result = event.target.result;
        let timestamps;//,max, min;
        [result, timestamps] = createTimeStampedDict(checkRemoveHeaders(parseCSVToJSON(result)))
        let outputFilename = current_file.split('_')[0] + "_" + result[timestamps[0]][0] + `_outputfile_${filter / 60}min-average_${new Date().getTime()}.csv`;
        p_el.children[2].innerHTML = outputFilename;

        let output = [];
        let current_stamp = timestamps[0];
        let row = result[current_stamp];
        let end_time = row[1];
        let counts = 0;
        for (let t = 1; t < timestamps.length; t++) {
            counts++;

            p_el.children[3].innerHTML = ((t / timestamps.length) * 100).toFixed(2) + "%";
            let diff = timestamps[t] - current_stamp;
            if (diff <= filter) {
                for (let i = 2; i < row.length; i++) {
                    row[i] = parseFloat(row[i]) + parseFloat(result[timestamps[t]][i]);
                }
                end_time = result[timestamps[t]][1]
            } else {
                row[1] += " - " + end_time;
                for (let i = 2; i < row.length; i++) {
                    row[i] /= counts;
                    row[i] = row[i].toFixed(4)
                }
                counts = 0;
                output.push(row);
                current_stamp = timestamps[t];
                row = result[current_stamp];
                end_time = row[1];
            }
        }
        row[1] += " - " + end_time;
        for (let i = 2; i < row.length; i++) {
            row[i] /= counts;
            row[i] = row[i].toFixed(4)
        }
        p_el.children[3].innerHTML = 'Preparing for download....';
        output.push(row);

        let csv_string = getHeaders(machine_id) + arrayToCSV(output)

        // do not let to close the model untill all the files are processed and download ready;
        document.querySelector('.modal').classList.remove('d-none');
        // flag complete
        p_el.children[3].innerHTML = 'Complete';
        p_el.scrollIntoView();
        downloadCSV(csv_string, outputFilename)
    });

    current_file = fObject.name.split('.')[0];
    reader.readAsText(fObject);
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
    document.querySelector('.download-list').appendChild(downloadLink);
    // Click download link with delay of 1sec
    setTimeout(downloadLink.click());
    setTimeout(function (element) {
        element.parentNode.removeChild(element);
        semaphore--;
        if(semaphore <= 0){
            document.querySelector('.loader').classList.add('d-none');
            document.querySelector('.cs').classList.remove('d-none');
            document.querySelector('.close-modal').scrollIntoView();
            console.log('Closing At',new Date(),new Date().getTime());
        }
    }, 2000, downloadLink);
}

function sleep(milliseconds = 1000){
    let cts = new Date().getTime()
    while(true){
        let diff = new Date().getTime() - cts;
        if(diff >= milliseconds) break;
    }
}

function messageProcessing(){
    
}

function run() {
    console.log('Starting At',new Date(),new Date().getTime());
    document.querySelector('.modal').classList.remove('d-none');
    document.querySelector('.starter').setAttribute('disabled', true);
    let tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    let input = document.getElementById('files');
    let c = 0;
    let flag = false;

    for (let m of available_machines) {
        if (m != active_machine && active_machine != 'ALL') continue

        for (let file of input.files) {
            if (file.name.includes(m)) {
                c++;
                flag = true;
                tbody.innerHTML += `<tr id="${m}_${c}">
                    <th scope='row'>${c}</th>
                    <td>${file.name}</td>
                    <td></td>
                    <td>0%</td>
                </tr>`;
            }
            if (flag) {
                flag = false;
                semaphore++;
                setTimeout(process, 100, file, m, m + "_" + c);
            }
        }
    }
}

function closeModal() {
    document.querySelector('.starter').removeAttribute('disabled');
    document.querySelector('.loader').classList.remove('d-none');
    document.querySelector('.cs').classList.add('d-none');
    // document.querySelector('.machine').classList.add('d-none');
    document.querySelector('.modal').classList.add('d-none')
    // let input = document.getElementById('files');
    // input.type = '';
    // input.type = 'file';
}