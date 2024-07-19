document.addEventListener('DOMContentLoaded', function() {
  const recipesContainer = document.getElementById('recipes-container');
  const recipeForm = document.getElementById('recipe-form-data');
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');
  
  let recipes = [];

  function fetchRecipes() {
    fetch('http://localhost:3000/italian')
      .then(response => response.json())
      .then(data => {
        recipes = data;
        displayRecipes(recipes);
      })
      .catch(error => console.error('Error fetching recipes:', error));
  }

  function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
      const recipeCard = document.createElement('div');
      recipeCard.classList.add('recipe-card');
      recipeCard.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
        <p><strong>Steps:</strong> ${recipe.steps}</p>
        <p><strong>Rating:</strong> <span id="rating-${recipe.id}">${recipe.rating || 0}</span></p>
        <button class="rating-button" data-id="${recipe.id}">Rate</button>
        <button class="delete-button" data-id="${recipe.id}">Delete</button>
      `;
      recipesContainer.appendChild(recipeCard);
    });
  }

  function saveRecipe() {
    const formData = new FormData(recipeForm);
    const imageFile = formData.get('image');
    const newRecipe = {
      id: parseInt(formData.get('recipe-id')) || recipes.length + 1,
      title: formData.get('title'),
      ingredients: formData.get('ingredients'),
      steps: formData.get('steps'),
      image: imageFile ? URL.createObjectURL(imageFile) : '',
      rating: 0
    };

    const existingRecipeIndex = recipes.findIndex(recipe => recipe.id === newRecipe.id);
    if (existingRecipeIndex !== -1) {
      recipes[existingRecipeIndex] = newRecipe;
    } else {
      recipes.push(newRecipe);
    }

    saveRecipesToJson();
    clearForm();
    displayRecipes(recipes);
  }

  function saveRecipesToJson() {
    fetch('http://localhost:3000/italian', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipes)
    })
    .then(response => response.json())
    .then(data => console.log('Recipes saved:', data))
    .catch(error => console.error('Error saving recipes:', error));
  }

  function deleteRecipe(id) {
    recipes = recipes.filter(recipe => recipe.id !== id);
    saveRecipesToJson();
    displayRecipes(recipes);
  }

  function editRecipe(id) {
    const recipeToEdit = recipes.find(recipe => recipe.id === id);
    if (recipeToEdit) {
      recipeForm['recipe-id'].value = recipeToEdit.id;
      recipeForm['title'].value = recipeToEdit.title;
      recipeForm['ingredients'].value = recipeToEdit.ingredients;
      recipeForm['steps'].value = recipeToEdit.steps;
      // Remove image preview
      recipeForm['image'].value = '';
    }
  }

  function updateRating(id) {
    const ratingInput = prompt("Enter new rating (0-5):", "0");
    const newRating = parseInt(ratingInput);
    if (isNaN(newRating) || newRating < 0 || newRating > 5) return;

    const recipeToUpdate = recipes.find(recipe => recipe.id === id);
    if (recipeToUpdate) {
      recipeToUpdate.rating = newRating;
      updateRecipe(recipeToUpdate);
      // Update the rating display locally
      const ratingSpan = document.getElementById(`rating-${id}`);
      if (ratingSpan) {
        ratingSpan.textContent = newRating;
      }
    }
  }

  function updateRecipe(recipe) {
    fetch(`http://localhost:3000/italian/${recipe.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipe)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Recipe updated:', data);
      // No need to call displayRecipes here, as the rating is updated locally
    })
    .catch(error => console.error('Error updating recipe:', error));
  }

  function clearForm() {
    recipeForm.reset();
    recipeForm['recipe-id'].value = '';
  }

  recipesContainer.addEventListener('click', (event) => {
    const id = parseInt(event.target.dataset.id);
    if (event.target.classList.contains('delete-button')) {
      deleteRecipe(id);
    }
    if (event.target.classList.contains('rating-button')) {
      updateRating(id);
    }
  });

  saveButton.addEventListener('click', saveRecipe);
  cancelButton.addEventListener('click', clearForm);

  fetchRecipes();
});
