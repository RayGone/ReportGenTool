import os
import re as rgx

destination = '/home/regan/Repos/Remote-Repo/Kevin/SampleData' #path where the files are
os.chdir(destination)

filenames = os.listdir()
# filenames = ['PM607_20220605_log.csv','PM607_20220606_log.csv','PM608_20220605_log.csv','PM608_20220606_log.csv']

for file in filenames:
    if('.csv' in file):
        print(file)
        with open(file,'r',encoding='utf-8') as fh:
            f_content = fh.read()
            f_content = f_content.replace('"','')
            f_content = f_content.replace('Date,Time','Date,Time')
            f_content = f_content.replace('t_stamp','Date,Time')
            date_strings = rgx.findall("\d{4}-\d{2}-\d{2} \d+:\d{2}:\d{2}\.\d{3}",f_content);
            for date in date_strings:
                d,t = date.split( )
                f_content = f_content.replace(date,d+","+t)
                
            fh.close()
            fh = open(file,'w',encoding='utf-8')
            fh.write(f_content)
            fh.close()

        