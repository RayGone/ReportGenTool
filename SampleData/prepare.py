import os
import re as rgx

print(os.getcwd())
os.chdir(os.path.join(os.getcwd(),'SampleData'))

filenames = ['PM607_20220605_log.csv','PM607_20220606_log.csv','PM608_20220605_log.csv','PM608_20220606_log.csv']

for file in filenames:
    with open(file,'r',encoding='utf-8') as fh:
        f_content = fh.read()
        f_content = f_content.replace('"','')
        date_strings = rgx.findall("\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}",f_content);
        for date in date_strings:
            d,t = date.split(" ")
            f_content = f_content.replace(date,d+","+t)
            
        fh.close()
        fh = open(file,'w',encoding='utf-8')
        fh.write(f_content)
        fh.close()

        