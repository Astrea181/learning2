﻿/* main */
$(function() {
    
//Изменение вида карточек
    if ($('.catalog .changeview').length) {
        if (localStorage.getItem('catalogview')) {
            $('.catalog').addClass('line');
        } else {
            $('.catalog').removeClass('line');
        }
        
        $('.catalog .changeview').on('click', function() {
            $('.catalog').toggleClass('line');
            toggleLocalStorage('catalogview', 'line');
        });
    }

//Галерея
	$('.gallery').each(function() {
        makeGallery($(this));
    });
	
//Календарь
	$('.datepicker').each(function() {
		let field = $('#date');
		let today = new Date();
		field.val(`${today.getFullYear()}-${addZero(today.getMonth() + 1)}-${addZero(today.getDate())}`);
		makeDatepicker($('#datepicker, #date'), $('#date'));
	})
	
//Лайтбокс
    $('.mainimagedesk img').on('click', function() {
        lightBox(this);
    });
	
//Бронирование
    $('.idroom .buybutton').on('click', function() {
        let room = {
            id: $(this).parents('.idroom').data('roomid'),
            name: $(this).parents('.idroom').find('.roomname').html(),
            price: +$(this).parents('.idroom').find('.price').html(),
            quantity: 1,
			date: document.forms.buyform.date.value,
			night: +document.forms.buyform.night.value
        }

        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify(room),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        .then(response => response.json())
        .then(json => console.log(json));
        let basket = JSON.parse(localStorage.getItem('basket'));
        if (!basket) basket = [];
		
		let res = basket.find(item => item.id == room.id && item.date == room.date && item.night == room.night);
		if (res) {
			res.quantity += room.quantity;
		} else {basket.push(room);
		}
		
        localStorage.setItem('basket', JSON.stringify(basket));
    });
	
    
	
	if ($('main.order').length) {
        let point = $('.table tbody');
		let count = 1;
        let basket = JSON.parse(localStorage.getItem('basket'));
        if (!basket) {
            $('main.order').addClass('empty');
            return;
        };
        for (let item of basket) {
            let hlpstr = '<tr data-id="'+item.id+'"><td class="name">'+item.name+'</td><td class="qty"><span class="minus">&#8722;</span><strong>'+item.quantity+'</strong><span class="plus">&#43;</span></td><td class="price"><span>'+item.price+'</span></td><td class="date">'+item.date+'</td><td class="night"><span class="minus">&#8722;</span><strong>'+item.night+'</strong><span class="plus">&#43;</span></td><td class="sum"><span></span></td><td class="delete">&#xe90a;</td></tr>';
            point.append(hlpstr);
			count++;
        }
        orderReCount();
        $('.table .plus').on('click', function(){
            changeOrder(this, 1);
        });
        $('.table .minus').on('click', function(){
            changeOrder(this, -1);
        });
        $('.table .delete').on('click', function(){
            deleteRow(this);
        });
		
		
		//Форма бронирования
        $('main.order form .submit').click(function(){
            $('.is-invalid').removeClass('is-invalid');
            $('.invalid-feedback').remove();
            let form = document.forms.orderform; 
            let valid = true; 
            if (!form.name.value || !form.name.value.match(/[а-яА-ЯёЁa-zA-Z]/)) { 
                $('form #name').addClass('is-invalid').parents('.mb-3').append('<div class="invalid-feedback">Необходимо указать имя</div>'); 
                valid = false; 
            }
            if (!form.phone.value.match(/^((\+7)|(8))?\s?\(?\d{3}\)?\s?\d{3}\-?\d{2}\-?\d{2}$/)) {
                $('form #phone').addClass('is-invalid').parents('.mb-3').append('<div class="invalid-feedback">Необходимо указать телефон - 10 цифр</div>');
                valid = false;
            }
			if (!form.mail.value || !form.mail.value.match(/\w+@\w+\.\w+/)) { // если поле не заполнено или не адрес
                $('form #mail').addClass('is-invalid').parents('.mb-3').append('<div class="invalid-feedback">Необходимо указать E-mail</div>'); 
                valid = false; 
            }
			if (!form.agree.checked) { 
                $('form #agree').addClass('is-invalid').parents('.mb-3').append('<div class="invalid-feedback">Необходимо поставить галочку</div>'); 
                valid = false; 
            }
            if (valid) {
                let products = []; 
                $('.table tbody tr').each(function(){
                    let res = { 
                        id: this.dataset.id,
                        qty: +$(this).find('.qty strong').html(),
						night: +$(this).find('.night strong').html(),
						date: $(this).find('.date').html()
                    };
                    products.push(res);
                })
                let data = { 
                    name: form.name.value,
                    phone: form.phone.value,
                    mail: form.mail.value,
                    comm: form.comm.value,
                    order: products
					
                };
				console.log(JSON.stringify(data));
                fetch('https://jsonplaceholder.typicode.com/posts', { 
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }).then(response => response.json()).then(json => { 
                    localStorage.removeItem('basket'); 
                    getModalWindow('order'); 
                    $('.modal').append('<p>Большое спасибо за заказ!<br><b>Номер брони ' + json.id + '</b><br>Отправленные данные: ' + JSON.stringify(data) + '</p>'); 
                    $('main.order').addClass('empty'); 
                    form.reset(); 
                });
            }
        });
        
    }
	  
});



/* order */
function deleteRow(point) {
    $(point).parents('tr').remove();
    saveBasket();
    if ($('tbody tr').length) {
        orderReCount();
    } else {
        $('main.order').addClass('empty');
    }
}
function saveBasket() {
    basket = [];
    $('main.order table tr[data-id]').each(function() {
        let hlp = {
            id: $(this).data('id'),
            name: $(this).find('.name').html(),
            price: $(this).find('.price span').html(),
            quantity: +$(this).find('.qty strong').html(),
			night: +$(this).find('.night strong').html(),
			date: $(this).find('.date').html()
        }
        basket.push(hlp);
    });
    if (basket.length) {
        localStorage.setItem('basket', JSON.stringify(basket));
    } else {
        localStorage.removeItem('basket');
	}
}

function orderReCount() {
    let sum = 0;
    $('main.order table tr[data-id]').each(function() {
        let hlp = $(this).find('.qty strong').html() * $(this).find('.price span').html() * $(this).find('.night strong').html();
        sum += hlp;
        $(this).find('.sum span').html(hlp);
    });
    $('main.order .allsum span').html(sum);
}
function changeOrder(place, delta) {
    let hlp = +$(place).parents('td').find('strong').html() + delta;
    if (hlp <= 0) {
        deleteRow(place);
        return;
    } else {
        $(place).parents('td').find('strong').html(hlp);
    }
    saveBasket();
    orderReCount();
}

/* lightbox */
function lightBox(curimage) {
    getModalWindow('lightbox');
    let bigimage = curimage.src.replace('_540.', '_830.'); // вычисляем имя большой картинки
    let w, wfix, h, hfix, sides;
    w = document.documentElement.clientWidth - 150; // определяем максимальную доступную ширину
    h = document.documentElement.clientHeight - 150; // определяем максимальную доступную высоту
    sides = $(curimage).width() / $(curimage).height(); // определяем соотношение сторон картинки
    if (w > sides * h) { // если по соотношению сторон доступная ширина больше нужной
        wfix = Math.floor(sides * h); // вычисляем нужную ширину
        hfix = h;
    } else { // если по соотношению сторон доступная ширина меньше нужной
        wfix = w;
        hfix = Math.floor(w / sides); // вычисляем нужную высоту
    }
    // прописываем размеры модалке, вставляем в нее картинку, добавляем класс для плавного проявления
    $('#lightbox').css({width: wfix, height: hfix}).append(`<img src="${bigimage}">`).addClass('ready');
}


function addZero(num) {
    return num >= 10 ? num : '0' + num;
}

function getModalWindow(idname) {
    $('body').append('<div class="screener"></div><div class="modal" id="'+idname+'"><button type="button" class="close">&times;</button></div>');
    $('.screener, .modal .close').on('click', dropModalWindow);
}
function dropModalWindow() {
    $('.screener, .modal').remove();
}

//Запись в ЛокалСторедж
function toggleLocalStorage(key, value) {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value);
    }
}










