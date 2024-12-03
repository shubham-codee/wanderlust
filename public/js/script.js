
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

let inputSearch = document.querySelector(".search-input");
let inputButton = document.querySelector(".search-btn");
let result = document.querySelector("#result");

inputSearch.addEventListener('input', async (event) => {
    const country = event.target.value.trim();
    if (country) {
        try {
            let response = await fetch(`/search?country=${country}`);
            let     data = await response.text();
            result.innerHTML = data;
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        try {
            let response = await fetch(`/search?country=${""}`);
            let data = await response.text();
            result.innerHTML = data;
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

let filters = document.querySelectorAll(".filter");

filters.forEach(filter => {
    filter.addEventListener("click", async () => {
        try {
            let text = filter.querySelector("p").innerText;
            console.log(text);
            let response = await fetch(`/search?filter=${text}`);
            let answer = await response.text();
            result.innerHTML = answer;
        } catch (error) {
            console.log("Error: ", error);
        }
    })
})
