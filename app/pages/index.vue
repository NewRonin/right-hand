<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <section class="hero">
          <h1>Project Evaluation</h1>
          <p>Automate your project estimation process with our intelligent tool.</p>
          <VButton @click="navigateTo('/projects')">Start Now</VButton>
        </section>

        <section class="features">
          <h2>Why us?</h2>
          <ul>
            <li>- Instant project evaluation</li>
            <li>- Tools for analytics</li>
            <li>- User-friendly visualizations</li>
          </ul>
        </section>

        <section class="about">
          <h2>About</h2>
          <p>This web application is designed to simplify and standardize the project estimation process. Regardless of your field of activity.</p>
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Пока логика не требуется
</script>

<style scoped lang="scss">
.page-container {
  padding: 2rem;
  background: #f9f9f9;
  color: #333;
}

main {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero {
  max-width: 700px;

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .cta {
    padding: 0.75rem 1.5rem;
    background-color: #3498db;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2980b9;
    }
  }
}

.features, .about {
  max-width: 600px;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      font-size: 1.1rem;
      margin: 0.5rem 0;
    }
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}
</style>
