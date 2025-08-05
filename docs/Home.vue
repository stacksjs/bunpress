<script>
export default {
  name: 'Home',
  computed: {
    frontmatter() {
      return window.$frontmatter || {}
    },
  },
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section v-if="frontmatter.hero" class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 v-if="frontmatter.hero.name" class="name">
            {{ frontmatter.hero.name }}
          </h1>
          <p v-if="frontmatter.hero.text" class="text">
            {{ frontmatter.hero.text }}
          </p>
          <p v-if="frontmatter.hero.tagline" class="tagline">
            {{ frontmatter.hero.tagline }}
          </p>

          <div v-if="frontmatter.hero.actions && frontmatter.hero.actions.length" class="actions">
            <a
              v-for="(action, index) in frontmatter.hero.actions"
              :key="index"
              :href="action.link"
              class="action-button"
              :class="action.theme"
            >
              {{ action.text }}
            </a>
          </div>
        </div>

        <div v-if="frontmatter.hero.image" class="hero-image">
          <img :src="frontmatter.hero.image" alt="Hero Image">
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section v-if="frontmatter.features && frontmatter.features.length" class="features">
      <div class="container">
        <div class="features-grid">
          <div
            v-for="(feature, index) in frontmatter.features"
            :key="index"
            class="feature-item"
          >
            <div v-if="feature.icon" class="feature-icon">
              {{ feature.icon }}
            </div>
            <h2 class="feature-title">
              {{ feature.title }}
            </h2>
            <p class="feature-details">
              {{ feature.details }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.home-container {
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero section styles */
.hero {
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.hero-content {
  flex: 1;
}

.hero-image {
  flex: 1;
  text-align: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

.name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.text {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.tagline {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.action-button.brand {
  background-color: #4c6ef5;
  color: white;
}

.action-button.brand:hover {
  background-color: #3b5bdb;
}

.action-button.alt {
  background-color: rgba(76, 110, 245, 0.1);
  color: #4c6ef5;
}

.action-button.alt:hover {
  background-color: rgba(76, 110, 245, 0.2);
}

/* Features section styles */
.features {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-item {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: rgba(76, 110, 245, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feature-details {
  color: #666;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero .container {
    flex-direction: column;
  }

  .hero-content, .hero-image {
    flex: none;
    width: 100%;
  }

  .hero-image {
    margin-top: 2rem;
  }

  .text {
    font-size: 2rem;
  }
}
</style>
