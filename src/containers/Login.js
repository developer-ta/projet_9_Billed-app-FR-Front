import { ROUTES_PATH } from "../constants/routes.js";
export let PREVIOUS_LOCATION = "";

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;
    this.formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    this.formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    this.$employeeEmailInput = this.formEmployee.querySelector(`input[data-testid="employee-email-input"]`);
    this.$employeePasswordInput = this.formEmployee.querySelector(`input[data-testid="employee-password-input"]`);
    const errorSpanEmailHtml = `<span class='error' data-testid="errorSpan-email"></span>`;
    const errorSpanPasswordHtml = `<span class='error' data-testid="errorSpan-password"></span>`;
    this.$employeeEmailInput.insertAdjacentHTML("afterend", errorSpanEmailHtml);
    this.$employeePasswordInput.insertAdjacentHTML("afterend", errorSpanPasswordHtml);

    this.formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);
    this.formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }
  handleSubmitEmployee = (e) => {
    e.preventDefault();
    // 1 Dépendance l'alterne validator()
    let isValidForm = this.validator(this.$employeeEmailInput, this.$employeePasswordInput);

    if (!isValidForm) return;

    const user = {
      type: "Employee",
      email: this.$employeeEmailInput.value,
      password: this.$employeePasswordInput.value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    return (
      //  2 Dépendance l’interne login()
      this.login(user) &&
      this.login(user)
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
          this.PREVIOUS_LOCATION = ROUTES_PATH["Bills"];
          PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
          this.document.body.style.backgroundColor = "#fff";
        })
        .catch((err) => this.createUser(user))
    );
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const $adminEmail = this.formAdmin.querySelector(`input[data-testid="admin-email-input"]`);
    const $adminPassword = this.formAdmin.querySelector(`input[data-testid="admin-password-input"]`);
    const user = {
      type: "Admin",
      email: $adminEmail.value,
      password: $adminPassword.value,
      status: "connected",
    };

    if (!this.validator($adminEmail, $adminPassword)) return;
    this.localStorage.setItem("user", JSON.stringify(user));
    return (
      this.login(user) &&
      this.login(user)
        .catch((err) => this.createUser(user))
        .then(() => {
          this.onNavigate(ROUTES_PATH["Dashboard"]);
          this.PREVIOUS_LOCATION = ROUTES_PATH["Dashboard"];
          PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
          document.body.style.backgroundColor = "#fff";
        })
    );
  };

  validator = ($email, $passWord) => {
    const patternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    const errorMg = {};
    let isValide = true;

    const errorSpans = this.formEmployee.querySelectorAll(`span[class='error']`);
    const handleErrorSpan = (mg, i) => {
      errorSpans[i].innerHTML = mg;
      return errorSpans[i];
    };
    //pour email
    if (!$email.value.trim()) {
      errorMg["empty"] = "Veuillez entrer une adresse email valide";
      handleErrorSpan(errorMg.empty, 0).style.display = "block";
      isValide = false;
    } else if (!patternEmail.test($email.value.trim())) {
      errorMg["invalid"] = "L'email que vous avez saisie est invalide. Veuillez réessayer";

      handleErrorSpan(errorMg.invalid, 0).style.display = "block";
      isValide = false;
    } else if (isValide) {
      errorSpans[0].style.display = "none";
    }
    //pour passWord
    if (!$passWord.value.trim()) {
      errorMg["empty"] = "Veuillez entrer votre mot de passe";
      handleErrorSpan(errorMg.empty, 1).style.display = "block";
      isValide = false;
    } else if (isValide) {
      errorSpans[1].style.display = "none";
    }
    //cas general
    return isValide;
  };
  // not need to cover this function by tests
  login = (user) => {
    if (this.store) {
      // 3 login 1 Dépendance Externe  store.login()
      // return Promise.then(obj) | null
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        ) //si résolue
        .then(({ jwt }) => {
          localStorage.setItem("jwt", jwt);
        });
    } else {
      return null;
    }
  };

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.store) {
      return this.store //3 login 1 Dépendance Externe  store.users().create()
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
         
          return this.login(user);
        });
    } else {
      return null;
    }
  };
}
