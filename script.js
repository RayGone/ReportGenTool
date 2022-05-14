var active_machines = [];

function getHeaders(machine_id){
    var pm3_headers = 'Date,Time,A400 Circuit Status,A270 Circuit Status,PM-03 Device Status,BC-82 Device Status,PM-03 Sound Control FB,PM-03 Sound Control SP,PM-03 Sound Control CV,BC-82 Speed SP,PM-03 Sound Control Enable,BE-15 Amps\n';
    var pm6_headers = 'Date,Time,AS-06 Flow %,FA-54 Amps %,FA-54 Flow %,FI-04 DP,FA-54 Drive Bearing Temp,FA-54 Non-Drive Bearing Temp,PM-06 Feed Side Bearing Temp,PM-06 Outlet Side Bearing Temp,CW-13 %,CW-14 %,CW-15 %,CW-16 %,CW-17 %,CW-18 %,,,PM-06 Amps %,FA-54 Speed %,FA-54 Drive Bearing Vibration,FA-54 Non-Drive Bearing Vibration,FA-54 Primary Flow SP,FA-54 Primary Flow FB,PM-06 U Winding Temp,PM-06 V Winding Temp,PM-06 W Winding Temp,PM-06 Drive Side Bearing Temp,PM-06 Non-Drive Side Bearing Temp,FA-54 U Winding Temp,FA-54 V Winding Temp,FA-54 W Winding Temp,FA-54 Drive Side Bearing Temp,FA-54 Non-Drive Side Bearing Temp,LU-06 Grease Pump Enabled,LU-06 Grease Pump Run Status,LU-06 Grease Pump System Fault Status,LU-06 Grease Pump Min Since Last Cycle,LU-06 Grease Pump Run Time (Min),BC-88 TPH FB,BC-88 TPH SP,BC-88 Speed %,PM-06 Amps,FA-54 Amps,SI-23 Tons,PM-06 Tons SP,CW-13 RPM,CW-14 RPM,CW-15 RPM,CW-16 RPM,CW-17 RPM,CW-18 RPM,CW-13 Power FB,CW-14 Power FB,CW-15 Power FB,CW-16 Power FB,CW-17 Power FB,CW-18 Power FB,BC-88 Feed Rate,BC-88 Feed Rate By SI-23 Weight\n';
    switch(machine_id){
        case 'PM03':
            return pm3_headers;

        case 'PM06':
            return pm6_headers;

        default:
            return '';
    }
}

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
        sel_lbl.innerHTML += `<span class='badge badge-pill badge-primary display-4 m-3'>${m}</span>`;
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

function processUpdate(rowID){

}

function process(fObject,machine_id,pid) {
    let p_el = document.getElementById(pid);
    document.querySelector('.modal').classList.toggle('d-none')

    let current_file;
    let reader = new FileReader();

    reader.addEventListener('load', (event) => {
        let filter = document.querySelector('[name=filter]').value * 60;
        var result = event.target.result;
        let timestamps;//,max, min;
        [result, timestamps] = createTimeStampedDict(parseCSVToJSON(result))
        let outputFilename = current_file.split('_')[0] + "_" + result[timestamps[0]][0] + `_outputfile_${filter/60}min-average_${new Date().getTime()}.csv`;
        p_el.children[2].innerHTML = outputFilename;

        let output = [];
        let current_stamp = timestamps[0];
        let row = result[current_stamp];
        let end_time = row[1];
        let counts = 0;
        for (let t = 1; t < timestamps.length; t++) {
            counts++;

            p_el.children[3].innerHTML = ((t/timestamps.length)*100).toFixed(2) + "%";
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
        downloadCSV(csv_string,outputFilename)
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
    setTimeout(function(element){
        element.parentNode.removeChild(element)
    },3000,downloadLink);
}

function run(){
    document.querySelector('.modal').classList.remove('d-none')
    document.querySelector('.starter').setAttribute('disabled',true);
    let tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    let input = document.getElementById('files');
    let c = 0;
    let flag = false;
    for(let m of active_machines){
        if(m!='PM03') continue
        //if(!(m == 'PM03' || m == 'PM06')) continue;

        for(let file of input.files){
            if(file.name.includes(m)){
                c++;
                flag = true;
                tbody.innerHTML += `<tr id="${m}_${c}">
                    <th scope='row'>${c}</th>
                    <td>${file.name}</td>
                    <td></td>
                    <td>0%</td>
                </tr>`;
            }
            if(flag){
                flag = false;
                setTimeout(process,1000,file,m,m+"_"+c);
            }
        }
    }
}

function closeModal(){
    document.querySelector('.starter').removeAttribute('disabled');    
    document.querySelector('.machine').classList.add('d-none');
    document.querySelector('.modal').classList.add('d-none')
    let input = document.getElementById('files');
    input.type = '';
    input.type = 'file';
}