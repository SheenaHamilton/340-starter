let today = new Date(),
    day = today.getDate(),
    month = today.getMonth() + 1, //January is 0
    year = today.getFullYear();

today = year + '-' + month + '-' + day;

const apt_date = document.querySelector('#apt_date');
apt_date.setAttribute('min', today);