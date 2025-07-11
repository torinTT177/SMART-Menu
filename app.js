$(document).ready(function(){
    // Uses the fetch() API to request category recipes from TheMealsDB.com API
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
    .then(res => res.json())
    .then(res => {
        const navBar = $('.navbar-list');
        if(navBar.length) {
            res.meals.forEach(meal => {
                let listCategory = ''
                listCategory += `
                    <li class="navbar-item">
                    <a onclick="fetchCategoryMeal('${meal.strCategory}')"
                        class="navbar-link-category" tabindex="0" href="#mealCardsSection">${meal.strCategory}</a>
                    </li>`;
                navBar.append(listCategory);
            });
        }
    })

    // Fetch searched recipe
$('.btnSearchRecipe').on('click', function(){
    fetchMeal('u');
})

// Handle food preferences form submission
$('#foodPreferences').on('submit', function(e){
    e.preventDefault();
    const cuisine = $('#foodType').val().trim();
    if(cuisine) {
        fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + encodeURIComponent(cuisine))
        .then(res => res.json())
        .then(res => {
            if(res.meals) {
                createMealCards(res.meals);
                window.scrollTo(0, $('#mealCardsSection').offset().top);
            } else {
                fetchMeal('u'); // Fallback to general search
            }
        })
        .catch(e => {
            console.warn(e);
            fetchMeal('u'); // Fallback to general search
        });
    }
});

    //also this could be easily refactored, maybe open issue for this too

    // Fetch content after 3s
    setTimeout(getData(['u']), 1000);
});

// Get recipe list based on search input
$(document).keypress(function(e) {
    if( e.which == 13 && $.trim($('#searchRecipe').val()) !== '' ) {
        fetchMeal('u');
    }
});

// Show recipe of clicked meal
$(document).on('click','.mealCardRecipeBtn',function(){
    let meal = $(this).data('meal');
    sessionStorage.setItem('currentMeal', JSON.stringify(meal));
    window.location.href = 'recipe.html?id=' + meal.idMeal;
});

// Load recipe details when recipe.html loads
if(window.location.pathname.includes('recipe.html')) {
    let mealId = new URLSearchParams(window.location.search).get('id');
    let meal = null;
    
    if(mealId) {
        meal = {idMeal: mealId};
    } else {
        meal = JSON.parse(sessionStorage.getItem('currentMeal'));
    }
    
    if(meal) {
        fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+meal.idMeal)
        .then(res => res.json())
        .then(res => {
            const recipe = res.meals[0];
            
            // Set basic recipe info
            $('#recipeTitle').text(recipe.strMeal);
            $('#recipeImage').attr('src', recipe.strMealThumb).attr('alt', recipe.strMeal);
            
            // Add ingredients
            const ingredientsList = $('#ingredientsList');
            ingredientsList.empty();
            
            for(let i = 1; i <= 20; i++) {
                if(recipe['strIngredient'+i]) {
                    const ingredient = recipe['strIngredient'+i];
                    const measure = recipe['strMeasure'+i];
                    ingredientsList.append(`<li>${measure} ${ingredient}</li>`);
                }
            }
            
            // Add instructions
            const instructionsList = $('#instructionsList');
            instructionsList.empty();
            
            const instructions = recipe.strInstructions.split('\r\n').filter(step => step.trim());
            instructions.forEach(step => {
                instructionsList.append(`<li>${step}</li>`);
            });
        })
        .catch(e => console.warn(e));
    }
}

// Clear search box on button press
$(document).on('click','.clear-field',function(){
    document.getElementById('searchRecipe').value = '';
});

// Uses the fetch() API to request random meal recipe from TheMealsDB.com API
function fetchMeal(type){
    if ( type === 'u' ) {
        fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+$.trim($('#searchRecipe').val()))
        .then( res => res.json() )
        .then( res => {
            let user_search_term = $.trim($('#searchRecipe').val());
            if (res.meals) {
                $("#errorMessageContainer").remove();
                createMealCards(res.meals);           
                window.scrollTo(0,$('#mealCardsSection').offset().top);
                $('#userInput').text(user_search_term);
                setCache(res.meals, type);
            } else {
                $("#mealCardsSection .container").hide();
                $("#mealCardsSection").prepend("<div id='errorMessageContainer' style='display:flex;'> <p id='errorMessageText'>No recipes match the search term '" + user_search_term + "'</p> <a id='errorMessageBtn' class='button' href='#landing' title='Search again' >Search again</a> </div>")
            }   
        })
        .catch( e => console.warn(e) );
    }
}

// remove error message
$(document).on('click','#errorMessageBtn',function(){
    $("#errorMessageContainer").remove();
});

// Function to save the data in the cache
const setCache = (meal, type) => {
    let mealJson = JSON.stringify(meal);
    sessionStorage.setItem("search", $.trim($('#searchRecipe').val()));
    sessionStorage.setItem(type, mealJson);
}

// Function to get cache data if it exists, otherwise, fetch from the API
const getData = (types) => {
    types.forEach(type => {
        if( type === "u" ) {
            let mealData = JSON.parse(sessionStorage.getItem(type));
            if( mealData !== null ) {
                createMealCards(mealData);      
                window.scrollTo(0,$('#mealCardsSection').offset().top);
                $('#userInput').text(sessionStorage.getItem("search"));
            }
        }
    })
}

function fetchCategoryMeal(category){
    fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category)
        .then(res => res.json())
        .then(res => {
            createMealCards(res.meals);
            window.scrollTo(0, $('#mealCardsSection').offset().top);
        })
    .catch(e => console.warn(e));
    $('#userInput').text(category);
}

// Creates meal cards based on search form
const createMealCards = meals => {
    let mealCards = '';

    meals.forEach(meal => {
        mealData = JSON.stringify(meal);
        mealData = mealData.replace(/(['])/g, "&rsquo;");
        mealCards += 
        `<div class="four columns"><div class="card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" title="${meal.strMeal}" class="u-max-full-width" />
            <div class="card-body">
                <div class="cardTitle">${meal.strMeal}</div>
                <button class="button mealCardRecipeBtn" data-meal='${mealData}'>Recipe</button>
            </div>
        </div></div>`;
    });
    $('.mealCards').html(mealCards);
    $('#mealCardsSection .container').show();
}
