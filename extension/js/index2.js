const tag = document.querySelector('.chobox .tag p')
console.log(tag);
const tags = document.querySelector('.chobox .tags')
const tag2 = document.querySelector('.fitem .tagipt input')
const tags2 = document.querySelector('.fitem .tags')
const newtag_btn = document.querySelector('.tsbox')
const newtag_btn2 = document.querySelector('.fitem .tsbox')
const addipt = document.querySelector('.chobox .addipt')
const addipt2 = document.querySelector('.fitem .addipt')
const timeipt = document.querySelector('.timebox input')
const schedule = document.querySelector('#schedule-box')

newtag_btn.addEventListener('click', function () {
    newtag_btn.classList.toggle('on')
    addipt.classList.toggle('on')
})
newtag_btn2.addEventListener('click', function () {
    newtag_btn2.classList.toggle('on')
    addipt2.classList.toggle('on')
})
tag.addEventListener('click', function () {
    4
    tags.classList.toggle('on')
})
tag2.addEventListener('click', function () {
    tags2.classList.toggle('on')
})

timeipt.addEventListener('click', function () {
    schedule.classList.toggle('on')
})
document.querySelector('#date2').addEventListener('click', function () {
    document.querySelector('#schedule-box2').classList.toggle('on')
})


const editbtn = document.querySelectorAll('.listbox .content .list .item .edit')
const editbox = document.querySelector('.editbox')
const close = document.querySelector('.close')
for (let i = 0; i < editbtn.length; i++) {
    editbtn[i].addEventListener('click', function () {
        editbox.classList.toggle('on')
    })
}
close.addEventListener('click', function () {
    editbox.classList.toggle('on')
})

const statusbtn = document.querySelectorAll('.status')
for (let i = 0; i < statusbtn.length; i++) {
    statusbtn[i].addEventListener('click', function () {
        this.classList.toggle('ina')
    })
}

const deletebtn = document.querySelectorAll('.listbox .content .list .item .delete span')

for (let i = 0; i < deletebtn.length; i++) {
    deletebtn[i].addEventListener('click', function () {
        this.parentElement.parentElement.remove()
    })
}

var mySchedule = new Schedule({
    el: '#schedule-box',
    clickCb: function (date) {
        timeipt.value = date
    },
    nextMonthCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    nextYeayCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    prevMonthCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    prevYearCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    }
});
var mySchedule2 = new Schedule({
    el: '#schedule-box2',
    clickCb: function (date) {
        document.querySelector('#date2').value = date
    },
    nextMonthCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    nextYeayCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    prevMonthCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    },
    prevYearCb: function (currentYear, currentMonth) {
        console.log('currentYear:' + currentYear, 'currentMonth:' + currentMonth)
    }
});