const string = ' 14 990 Ft  Egységár 14 990 Ft/egységár/ db ';

const regex = /^.*?(\d[\d\s]*)(?=\s*Ft)/;

const match = string.match(regex);

if(match){
    console.log(match[0]);
}