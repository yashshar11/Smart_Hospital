

$(document).ready(function () {
    // Click event handler for the "Add Item" button

    $('#addInputField').click(function () {
        addItem();
    });

    // Keyup event handler for Medicine Name input
    $('input[name="Medicine_name"], input[name="Stock"], input[name="Medicine_id"]').keyup(function (event) {
        // Check if it's a space key (key code 32)
        if (event.keyCode === 32) {
            addItem();
        }
    });


    function addItem() {
        // Capture the values from the initial input fields
        const initialMedicineName = $('input[name="Medicine_name"]').val();
        const initialMedicineId = $('input[name="Medicine_id"]').val();
        const initialStock = $('input[name="Stock"]').val();

        if (!initialMedicineName || !initialMedicineId || !initialStock) {
            alert('Please fill in all fields before adding an item.');
            return;
        }

        // Create a new input set with the captured values
        const inputSet = $('<div class="input-set">');
        const medicineNameInput = $(`<input class="form-style-place" type="text" name="medicine_name[]" placeholder="Medicine Name" required value="${initialMedicineName}">`);
        const medicineIdInput = $(`<input class="form-style-place" type="text" name="medicine_id[]" placeholder="Medicine ID" required value="${initialMedicineId}">`);
        const unitInput = $(`<input class="form-style-place" type="number" name="stock[]" placeholder="Unit Sell" required value="${initialStock}">`);
        const deleteButton = $('<button type="button" class="deleteInputField"><img src="/images/delete.png"></button>');

        // Clear the input values
        $('input[name="Medicine_name"]').val('');
        $('input[name="Medicine_id"]').val('');
        $('input[name="Stock"]').val('');

        // Append the new fields to the container
        inputSet.append(medicineNameInput);
        inputSet.append(unitInput);
        inputSet.append(medicineIdInput);
        inputSet.append(deleteButton);
        $('#inputFieldsContainer').append(inputSet);
    }

    // Other parts of your script...
});
$(document).ready(function () {
    $(document).on('click', '.deleteInputField', function () {
        $(this).parent().remove();
    });
    $('#updateInventoryForm').submit(function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect data from dynamically added input fields
        const formData = $(this).serializeArray();

        // Use formData to send the data to the server using AJAX
        $.ajax({
            type: 'POST',
            url: '/inventory/drop',
            data: formData,
            success: function (data) {
                // Handle the response from the server (if needed)
                console.log('Form submitted successfully', data.data.pdfFilePath);
                // You can update the UI or perform other actions here
            },
            error: function (error) {
                console.error('Form submission failed', error);
                // Handle errors or display error messages here
            }
        });
    });

});



function autocomplete(inp, arr, medicine_details) {
    console.log(arr);
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    console.log('hello');
                    console.log(medicine_details);
                    fetchMedicineId(inp.value, medicine_details);
                    closeAllLists();
                });

                async function fetchMedicineId(medicineName, medicine_details) {
                    // Make an asynchronous request to fetch medicine ID
                    const selectedMedicine = medicine_details.find(medicine => medicine.name === medicineName);

                    if (selectedMedicine) {
                        const selectedMedicineId = selectedMedicine.id;
                        console.log(`Selected Medicine ID: ${selectedMedicineId}`);

                        // Now you can use the selectedMedicineId as needed, for example, update another input field
                        // For demonstration, let's update the Medicine ID input field
                        $('input[name="Medicine_id"]').val(selectedMedicineId);
                    } else {
                        console.error(`Medicine details not found for ${medicineName}`);
                    }
                }

                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}