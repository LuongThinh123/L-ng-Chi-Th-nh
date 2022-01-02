function Validator(formSelector) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {
    }
///^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
            }
        },
        sdt: function(value) {
            var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return regex.test(value) ? undefined : 'Vui lòng nhập số điện thoại hợp lệ'
        },
        password_comfirm: function(value) {
            var password = $('.signup-form #password');
            if(password.value == value) {
                return undefined;
            } else return 'Mật khẩu nhập lại không đúng'
        }
    }
    // console.log(formSelector)
    //lấy ra element
    var formElement = $(formSelector);
    console.log(formElement)

    //nếu có element mới xử lý
    if(formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs) {

            var rules = input.getAttribute('rules').split('|');

            for(var rule of rules) {

                var isRuleHasValue = rule.includes(':');
                var ruleInfo; 
                if(isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    //console.log(validatorRules[rule](ruleInfo[1]))
                }

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                 //   console.log(validatorRules[rule]);
                    formRules[input.name] = [ruleFunc]
                }

                    
                // Lắng nghe sự kiện validate (blur, change...)
                input.onblur = handleValidate;
                input.oninput = handleClearError;
            }

            
            // formRules[input.name] = input.getAttribute('rules');
        }
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage; 
            rules.find(function(rule) {
                errorMessage = rule(event.target.value);
                return errorMessage;
           });
           //nếu có lỗi thì hiện thị
           if(errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if(formGroup) {
                    formGroup.classList.add('invalid');

                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
           }
           console.log(errorMessage);
           return !errorMessage;
        }

        // hàm clear message lỗi
        function handleClearError (event) {
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')

                var formMessage = formGroup.querySelector('.form-message');
                if(formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }

    //Xử lý hành vi submit formMessage formElement.onsubmit
    const signupBtn = $('.signup-btn');

    signupBtn.onclick = function (event) {
        // event.PaginationS
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = false;
        for(var input of inputs) {
            if(handleValidate({target: input})) {
                isValid = true;
            }
        }

        if(isValid) {
            signupBtnClick ();
        }
    }
}

const loginForm = $('#login-form');
const signupForm = $('#register-form');

// Validator(loginForm);

function switchLoginSignup () {
    const switchBtn = $$('.auth-form__switch-to');
    const loginForm = $('.auth-form-login');
    const signupForm = $('.auth-form-signup');

    switchBtn.forEach((item, index) => {
        item.onclick = function (e) {
            if(e.target.classList.contains('signup')) {
                $('.auth-form-login').classList.remove('active');
                signupForm.classList.add('active');
           } 
            else{   
                 $('.auth-form-signup.active').classList.remove('active');
                 loginForm.classList.add('active');
           }
        }
    });
}

switchLoginSignup ();

function openUserLoginForm () {
    const modalLoginSignup = $('.modal__body');
    const modal = $('.modal');
    const navUser  = $('.nav__user .user__icon');

    navUser.onclick = () => {

        if($('.auth-form-signup.active')) {
            $('.auth-form-signup.active').classList.remove('active');
            $('.auth-form-login').classList.add('active');
        }
        modal.style.display = 'flex';
        modalLoginSignup.style.display = 'block';
    }
}

openUserLoginForm ();


function loginBtnClick () {
    const loginBtn = $('.login-btn');
    loginBtn.onclick = function () {
        let checkLogin = false;
        let userName = $('.username-input').value
        let userPassword = $('.password-input').value
        let userCurrent;
        if(userName == '' || userPassword == '') {
            alert('Vui lòng nhập đầy đủ thông tin')
        } else {        
            let userList = UserModel.getAll();
            userList.forEach(function (user) {
                if(user.username == userName && user.password == userPassword) {
                    checkLogin = true;
                        userCurrent = user;
                    
                }
            })
            if(checkLogin == true) {
                    $('.close-btn').click();
                    $('.modal__notification-box .notification-description').innerText = 'Quý khách đã đăng nhập thành công !!!';
                    $('.modal').style.display = 'flex';
                    $('.modal__notification-box').style.display = 'flex';

                    $('.nav__user').classList.add('nav__user--active');
                    $('.user__menu-username').innerText = `${userCurrent.username}`;
                    updateProductInCart(userCurrent.cart);
                    UserModel.updateUserCurrent(userCurrent);
                    orderPageRender();
            }
            else {
                alert('Tài khoản hoặc mật khẩu không đúng');
            }
        }
    }

}

loginBtnClick ();

function logoutClick () {
    const logoutBtn = $('.user__menu--logout');

    logoutBtn.onclick = function() {
        let userList = UserModel.getAll();
        let userCurrent =  UserModel.getUserCurrent();
        userList.forEach(function (user) {
           if(user.username == userCurrent.username) {
                user.cart = getProductInCart();
           }
       })

       UserModel.UpdateAll(userList);
    
       UserModel.updateUserCurrent(null); //null
       updateProductInCart([]);
       $('.nav__user').classList.remove('nav__user--active');
       orderPageRender();
       $('.nav__cart-notice').innerText = '0';
    }
}

logoutClick () ;

function signupBtnClick () {
    //const signupBtn = $('.signup-btn');

    // signupBtn.onclick = function () {
        let inputs = $$('.signup-form input'); 

        let fullname = inputs[0].value;
        let phone = inputs[1].value;
        let username = inputs[2].value;
        let password = inputs[3].value;
        let email = inputs[4].value;
        let confirm = inputs[5].value;

        /* check tài khoản tồn tại */
        let isError = false;
        UserModel.getAll().forEach(function (user) {
            if(user.username == username) {
                isError = true;
            }
        })

        if(isError) {
             alert("tên tài khoản đã tồn tại");
            return;
        }

        let user = {
            fullname, 
            phone, 
            username, 
            password, 
            cart: [],
        }

        UserModel.Insert(user);
        alert('đăng kí thành công');
        $('.username-input').value = user.username;
        $('.password-input').value = user.password;

        $$('.auth-form__switch-to')[1].click();

        inputs[0].value = '';
        inputs[1].value = '';
        inputs[2].value = '';
        inputs[3].value = '';
        inputs[4].value = '';
        inputs[5].value = '';
    // }
}

// signupBtnClick ();

function checkIfUserJustLogin () {  
    let productsInCart = getProductInCart ();
    let userCurrent = UserModel.getUserCurrent();

    if(userCurrent == null) return;

    if(UserModel.getUserCurrent().username != null) {
        $('.nav__user').classList.add('nav__user--active');
        updateProductInCart(userCurrent.cart = productsInCart); //= productsInCart
        UserModel.updateUserCurrent(userCurrent);
        $('.user__menu-username').innerText = `${userCurrent.username}`;
        // UserModel.updateUserCurrent(userCurrent);
    } 
}

checkIfUserJustLogin ();