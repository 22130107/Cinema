// Quick test to check API response
async function testAPI() {
  try {
    const res = await fetch('https://ophim1.com/v1/api/home');
    const json = await res.json();
    
    console.log('API Status:', json.status);
    console.log('Total movies:', json.data.items.length);
    
    const movies = json.data.items;
    
    // Count by category
    const categories = {};
    movies.forEach(movie => {
      if (movie.category && movie.category.length > 0) {
        movie.category.forEach(cat => {
          categories[cat.name] = (categories[cat.name] || 0) + 1;
        });
      }
    });
    
    console.log('\nMovies count by category (top 10):');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count}`);
      });
    
    // Count by country
    const countries = {};
    movies.forEach(movie => {
      if (movie.country && movie.country.length > 0) {
        movie.country.forEach(c => {
          countries[c.name] = (countries[c.name] || 0) + 1;
        });
      }
    });
    
    console.log('\nMovies count by country (top 10):');
    Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count}`);
      });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testAPI();
