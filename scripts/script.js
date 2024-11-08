function updateDateRangeLabel(range) {
    let v = parseInt(range.value);
    let m = v < 60 ? 0 : parseInt(v / 60);
    let s = v < 60 ? v : parseInt(((v / 60) - m) * 10);
    document.getElementById('agg-val').innerHTML = `${m}min ${s}s`;
}

// Notification.requestPermission();
var acceptable_machines = ['PM03','PM04','PM05','PM06','PM607','PM608']
var available_machines = [];
var selected_machines = [];
var active_machine = false;
var semaphore = 0;
var files_to_process = [];
var n_files = 0;
var processed_data = [];
var stop_exec = false;
var notification = null;
var file_regex_pattern = /\w+_\d+_log\.csv/i;

function getHeaders(machine_id) {
    var pm3_headers = 'Date,Start Time,End Time,A400 Circuit Status,A270 Circuit Status,PM-03 Device Status,BC-82 Device Status,PM-03 Sound Control FB,PM-03 Sound Control SP,PM-03 Sound Control CV,BC-82 Speed SP,PM-03 Sound Control Enable,BE-15 Amps\n';
    var pm4_headers = `,,,Main Parameters,,,,,,,,,,,,,,,Mill Parameters,,,,,,Fan Parameters,,,,,,,,,Classifier Parameters,,,,,\nDate,Start Time,End Time,PM-04 System total Air Flow % of Max,"ATP Secondary Airflow, % of Max",FI-OX DP,PM-04 Mill Motor Current %,PM-04 Feed Side Bearing Temp,PM-04 Outlet Side Bearing Temp,CW-01 %,CW-02 %,CW-03 %,CW-04 %,CW-05 %,CW-06 %,PM-04 Mill Weight,BC-84 Feed Rate,,Mill Main Drive motor Bearing 1 temp.,Mill Main Drive motor Bearing 2 temp.,Header Compressed Air Airflow Fdbk (CFM),Header Compressed Air Pressure Fdbk (PSI),Minex 4 Filter Compressed Air Pressure Fdbk (PSI),,Fan Bearing Temp. 1,Fan Bearing Temp. 2,Fan Bearing 1 Vib. ,Fan Bearing 2 Vib. ,Blower Motor Current %,FA-41 U Winding Temp,FA-41 V Winding Temp,FA-41 W Winding Temp,,CW-01 RPM,CW-02 RPM,CW-03 RPM,CW-04 RPM,CW-05 RPM,CW-06 RPM\n`;
    var pm5_headers = `,,,Main Parameters,,,,,,,,,,,,,,,Mill Parameters,,,,,,Fan Parameters,,,,,,Classifier Parameters,,,,,,\nDate,Start Time,End Time,FA-48 Primary Air Velocity (% of Max Primary),AS-05 Secondary Air Velocity (% of Max Primary),FI-O3 DP,PM-05 Mill Motor Current %,PM-05 Feed Side Bearing Temp,PM-05 Outlet Side Bearing Temp,CW-07 %,CW-08 %,CW-09 %,CW-10 %,CW-11 %,CW-12 %,PM-05 Mill Weight,BC-86 Feed Rate Scaled ,,PM-05 Header Compressed Air Pressure Fdbk (PSI),MX-4 Filter Compressed Air Pressure Fdbk (PSI),AC-05 Header Compressed Airflow Fdbk (CFM),BN-19 Level Fdbk %,Power Factor,,FA-48 Drive Bearing Temp,FA-48 Non-Drive Bearing Temp,FA-48 Drive Bearing Vibration,FA-48 Non-Drive Bearing Vibration,FA-48 System Fan Motor Current (%),,CW-07 RPM,CW-08 RPM,CW-09 RPM,CW-10 RPM,CW-11 RPM,CW-12 RPM,Classifier Speed Setpoint\n`;
    var pm6_headers = 'Date,Start Time,End Time,AS-06 Flow %,FA-54 Amps %,FA-54 Flow %,FI-04 DP,FA-54 Drive Bearing Temp,FA-54 Non-Drive Bearing Temp,PM-06 Feed Side Bearing Temp,PM-06 Outlet Side Bearing Temp,CW-13 %,CW-14 %,CW-15 %,CW-16 %,CW-17 %,CW-18 %,,,PM-06 Amps %,FA-54 Speed %,FA-54 Drive Bearing Vibration,FA-54 Non-Drive Bearing Vibration,FA-54 Primary Flow SP,FA-54 Primary Flow FB,PM-06 U Winding Temp,PM-06 V Winding Temp,PM-06 W Winding Temp,PM-06 Drive Side Bearing Temp,PM-06 Non-Drive Side Bearing Temp,FA-54 U Winding Temp,FA-54 V Winding Temp,FA-54 W Winding Temp,FA-54 Drive Side Bearing Temp,FA-54 Non-Drive Side Bearing Temp,LU-06 Grease Pump Enabled,LU-06 Grease Pump Run Status,LU-06 Grease Pump System Fault Status,LU-06 Grease Pump Min Since Last Cycle,LU-06 Grease Pump Run Time (Min),BC-88 TPH FB,BC-88 TPH SP,BC-88 Speed %,PM-06 Amps,FA-54 Amps,SI-23 Tons,PM-06 Tons SP,CW-13 RPM,CW-14 RPM,CW-15 RPM,CW-16 RPM,CW-17 RPM,CW-18 RPM,CW-13 Power FB,CW-14 Power FB,CW-15 Power FB,CW-16 Power FB,CW-17 Power FB,CW-18 Power FB,BC-88 Feed Rate,BC-88 Feed Rate By SI-23 Weight\n';
    var pm7_headers = `"Date",Start Time, End Time,"Area 6/Ecutec/PCC1/PCC1_p1160_ACT_V_OUT_ABS","Area 6/Ecutec/PCC1/PCC1_p3021_SPD_DEV_VAL","Area 6/Ecutec/PCC1/PCC1_p3421_SPD_DEV_VAL","Area 6/Ecutec/PCC1/PM607_AMPS_SUM"\n`;
    var pm8_headers = `"Date",Start Time,End Time,"Area 6/Ecutec/PCC2/PCC2_p1160_ACT_V_OUT_ABS","Area 6/Ecutec/PCC2/PCC2_p3021_SPD_DEV_VAL","Area 6/Ecutec/PCC2/PM608_AMPS_SUM"\n`;
    switch (machine_id) {
        case 'PM03':
            return pm3_headers;
        case 'PM04':
            return pm4_headers;
        case 'PM05':
            return pm5_headers;
        case 'PM06':
            return pm6_headers;
        case 'PM607':
            return pm7_headers;
        case 'PM608':
            return pm8_headers;
        default:
            return '';
    }
}

function checkRemoveHeaders(data = []) {
    let d_len = data.length;
    if (d_len > 0) {
        while (true) {
            let crow = fixCSV(data[0]);
            let dt = new Date(crow[0]);
            if (isNaN(dt)) {
                data.shift();
            } else {
                break;
            }
        }
        return data;
    }
    return [];
}

function fileDateParser(dateString) {
    let year = dateString.substr(0, 4);
    let month = dateString.length == 7 ? "0" + dateString.substr(4, 1) : dateString.substr(4, 2);
    let date = dateString.length == 7 ? dateString.substr(5, 2) : dateString.substr(6, 2)
    return `${year}-${month}-${date}`;
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
        if(!file_regex_pattern.test(file.name)) continue;
        let sp = file.name.split('_');
        let name = sp[0];
        if(!acceptable_machines.includes(name)) continue;
        let date = fileDateParser(sp[1]);
        if(date.includes('log')) continue;
        
        if (!(max_date && min_date)) max_date = min_date = date;
        else {
            if (date > max_date) max_date = date;
            if (date < min_date) min_date = date;
        }
        if (!available_machines.some(m => m == name) && acceptable_machines.some(m => m == name))
            available_machines.push(name)
    }

    document.querySelectorAll('[date]').forEach(elm => {
        elm.max = max_date;
        elm.min = min_date;
        if (available_machines.length == 1) elm.value = elm.max;
        else{
            elm.value = elm.name == 'from' ? elm.min : elm.max;
        }
    });

    let sel_lbl = document.getElementById('sel-mac');
    sel_lbl.innerHTML = '';

    for (let m of available_machines) {
        sel_lbl.innerHTML += `<span class='btn btn-sm btn-secondary btn-m display-4 m-3' onclick="selectMachine(this)">${m}</span>`;
    }
    // if(available_machines.length > 1)
    //     sel_lbl.innerHTML += `<span class='btn btn-sm btn-primary btn-m display-4 m-3' onclick="selectMachine(this)">ALL</span>`;
}


function listFilesToProcess(input,from,to){
    for (let file of input.files) {
        if (file.name.includes(active_machine) && file_regex_pattern.test(file.name)){
            if(from && to) {
                let fdate = fileDateParser(file.name.split('_')[1]);
                if(fdate<=to && fdate>=from){
                    files_to_process.push(file);
                }
            }
            else files_to_process.push(file);
        }
    }
}

function sortListedFilesByDate(){
    let dates = [];
    let files_by_date = {};
    let sorted_list = []
    for(let file of files_to_process){
        let d = new Date(fileDateParser(file.name.split('_')[1])).getTime();
        dates.push(d);
        files_by_date[d] = file;
    }    
    dates.sort();
    for(let i in dates){
        sorted_list.push(files_by_date[dates[i]])
    }
    files_to_process = sorted_list;
}

function selectMachine(selected = null) {
    if (selected) {
        if(selected.classList.contains('active')) selected_machines = selected_machines.filter( s => s!=selected.innerHTML);
        else selected_machines.push(selected.innerHTML);

        selected.classList.toggle('active');
        selected.classList.toggle('btn-secondary');
        selected.classList.toggle('btn-success');
    } else {
        let sm = document.querySelectorAll('.btn-m');
        for (let btn of sm) {
            btn.classList.remove('active');
            btn.classList.add('btn-secondary');
            btn.classList.remove('btn-success');
        }
    }
}

function parseCSVToJSON(text, omitFirstRow = false) {
    return text.slice(omitFirstRow ? csv.indexOf('\n') + 1 : 0)
        .split("\n")
        .map((element) => element.split(','));
}

function fixCSV(csvRow){
    for(let i in csvRow){
        csvRow[i] = csvRow[i].trim().replaceAll('"','').replaceAll("'","")
    }
    return csvRow;
}

function createTimeStampedDict(data) {
    let data_dict = {}
    let timestamps = []
    // let max = 0;
    // let min = 100000000000;
    for (let d of data) {
        if(d.length<3)break;
        d = fixCSV(d);
        time = new Date(d[0] + " " + d[1]);
        // console.log(time,d[0] + "-" + d[1])
        if (!time || isNaN(time)) break;
        time = parseInt(time.getTime() / 1000);
        // if (min > time) min = time;
        // if (time > max) max = time;
        timestamps.push(time)
        data_dict[time] = d;
    }
    timestamps.sort();
    return [data_dict, timestamps];//, max, min];
}

function arrayToCSV(arr, delimiter = ',') {
    return arr.map(v => v.map(x => `"${x}"`).join(delimiter)).join('\n');
}

function process(fObject, machine_id, pid) {
    // do not let to close the model untill all the files are processed and download ready;
    document.querySelector('.modal').classList.remove('d-none');

    let p_el = document.getElementById(pid);
    console.log(fObject.name);
    p_el.children[1].innerHTML = fObject.name;

    let reader = new FileReader();

    reader.addEventListener('load', (event) => {
        let filter = document.querySelector('[name=filter]').value;
        var result = event.target.result;
        let timestamps;//,max, min;
        [result, timestamps] = createTimeStampedDict(checkRemoveHeaders(parseCSVToJSON(result)))
        let output = [];
        let current_stamp = timestamps[0];
        let row = result[current_stamp];
        let end_time = row[1];
        let counts = 0;
        for (let t = 1; t < timestamps.length; t++) {
            counts++;
            let diff = timestamps[t] - current_stamp;
            if (diff <= filter) {
                for (let i = 2; i < row.length; i++) {
                    if(row[i])
                        row[i] = parseFloat(row[i]) + parseFloat(result[timestamps[t]][i]);
                }
                end_time = result[timestamps[t]][1]
            } else {
                for (let i = 2; i < row.length; i++) {
                    if(row[i]){
                        row[i] /= counts;
                        row[i] = row[i].toFixed(18);
                    }
                }
                row.splice(2,0,end_time);
                // row[1] += " - " + end_time;
                
                counts = 0;
                output.push(row);
                current_stamp = timestamps[t];
                row = result[current_stamp];
                end_time = row[1];
            }
        }
        
        //final batch----
        for (let i = 2; i < row.length; i++) {
            if(row[i]){
                row[i] /= counts;
                row[i] = row[i].toFixed(4)
            }
        }
        row.splice(2,0,end_time);
        // row[1] += " - " + end_time;
        output.push(row);
        output.reverse();// so that time is in ascending order
        //final batch end---

        processed_data = processed_data.concat(output);
        semaphore++;
        p_el.children[2].innerHTML = semaphore;

        if (stop_exec) {
            console.log('Force Close!!')
            stop_exec = false;

            // re-init variables
            semaphore = 0;
            processed_data = [];
            files_to_process = [];
            selected_machines = [];
            active_machine = false;
            stop_exec = false;

            console.log('re-initialized vars')
            console.log('Closing At', new Date(), new Date().getTime());
            closeModal();
            return;
        }

        if (files_to_process.length) {
            setTimeout((pid) => {
                p_el.children[3].innerHTML = ((semaphore + 1) * 100 / n_files).toFixed(2) + "%";
                process(files_to_process.pop(), active_machine, pid)
            }, 50, pid);
        }
        else {
            processed_data.reverse();
            let csv_string = getHeaders(machine_id) + arrayToCSV(processed_data);
            let count = semaphore
            // flag complete
            p_el.children[3].innerHTML = 'Complete';
            p_el.children[1].innerHTML = '-----------------';

            //download the file
            downloadCSV(csv_string, active_machine + `_${count}_` + new Date().getTime() + "_outputfile.csv");

            if(selected_machines.length){
                // fireNotification(`${active_machine} is complete!!`,"File is being downloaded!!!");
                files_to_process = [];
                processed_data = [];
                semaphore = 0;
                console.log('re-initialized vars')
                console.log('Closing At', new Date(), new Date().getTime());
                run();
                return;
            }
            // re-init variables
            semaphore = 0;
            processed_data = [];
            files_to_process = [];
            selected_machines = [];
            active_machine = false;
            stop_exec = false;

            console.log('re-initialized vars')
            console.log('Closing At', new Date(), new Date().getTime());

            document.querySelector('.close-modal').classList.remove('d-none');
            document.querySelector('.close-modal').scrollIntoView();
            return;
        }

        if (false) {
            console.log('Downloading because of semaphore', semaphore);
            let csv_string = getHeaders(machine_id) + arrayToCSV(processed_data);
            // re-init processed_data as the data is being downloaded
            processed_data = [];
            downloadCSV(csv_string, active_machine + `_${semaphore}_${new Date().getTime()}_outputfile.csv`);
        }
    });

    current_file = fObject.name.split('.')[0];
    reader.readAsText(fObject);
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csv = csv.replaceAll('NaN','');
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
        if (files_to_process.length == 0) {
            document.querySelector('.loader').classList.add('d-none');
            document.querySelector('.cs').classList.remove('d-none');
        }
    }, 2000, downloadLink);
}

function sleep(milliseconds = 1000) {
    let cts = new Date().getTime()
    while (true) {
        let diff = new Date().getTime() - cts;
        if (diff >= milliseconds) break;
    }
}

function fireNotification(msg_title='',msg_body=''){
    if (("Notification" in window) && false) {
        if(notification) notification.close();   
        // Let's check whether notification permissions have already been granted
        if (Notification.permission === "granted") {
            // If it's okay let's create a notification             
            notification = new Notification(msg_title,{
                body: msg_body
            });
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    notification = new Notification(msg_title,{
                        body: msg_body
                    });
                }
            });
        }
        else{
            alert(msg_title+"\n"+msg_body);
        }
    }else alert(msg_title+"\n"+msg_body);
}

function stop() {
    stop_exec = true;
}

function run() {
    if(selected_machines.length) active_machine = selected_machines.pop();

    if (!active_machine) {
        var msg_title = "No Machines are selected for processing!!!"
        var msg_body = "Select a Machine from the list.";
        fireNotification(msg_title,msg_body);
        return;
    }

    console.log('Starting At', new Date(), new Date().getTime());
    document.querySelector('.modal').classList.remove('d-none');
    document.querySelector('.starter').setAttribute('disabled', true);

    let tbody = document.querySelector('tbody');
    let input = document.getElementById('files');

    let from = '', to = '';

    from = document.querySelector('[name=from]').value;
    to = document.querySelector('[name=to]').value;

    listFilesToProcess(input,from,to);
    sortListedFilesByDate();

    n_files = files_to_process.length;
    if(!n_files){
        fireNotification('No Files to Continue!!!',"There are no files for "+active_machine+" on selected date range.")
        if(selected_machines.length) run();
        else closeModal();
        return;
    }
    file = files_to_process.pop();
    tbody.innerHTML += `<tr id="${active_machine}">
                    <td>${active_machine}</td>
                    <td>${file.name}</td>
                    <td>0</td>
                    <td>${((semaphore + 1) * 100 / n_files).toFixed(2)}%</td>
                </tr>`;

    process(file, active_machine, active_machine);
}

function closeModal() {
    document.querySelector('.starter').removeAttribute('disabled');
    document.querySelector('.loader').classList.remove('d-none');
    document.querySelector('.cs').classList.add('d-none');
    // document.querySelector('.machine').classList.add('d-none');
    document.querySelector('.modal').classList.add('d-none');
    document.querySelector('.close-modal').classList.add('d-none');
    document.querySelector('tbody').innerHTML = '';
    stop_exec = false;
    selectMachine();
}