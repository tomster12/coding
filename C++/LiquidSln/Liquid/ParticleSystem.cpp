
#include "stdafx.h"


class ParticleSystem : public sf::Drawable, public sf::Transformable
{
public:
    ParticleSystem(unsigned int count) :
        particles(count),
        particleVertices(sf::Points, count),
        particleLifetime(sf::seconds(3)),
        pos(0, 0)
    { }

    void setPos(sf::Vector2f position)
    {
        pos = position;
    }

    void update(sf::Time elapsed)
    {
        for (std::size_t i = 0; i < particles.size(); ++i)
        {
            // update the particle lifetime
            Particle& p = particles[i];
            p.lifetime -= elapsed;

            // if the particle is dead, respawn it
            if (p.lifetime <= sf::Time::Zero) resetParticle(i);
            
            // update the position of the corresponding vertex
            particleVertices[i].position += p.velocity * elapsed.asSeconds();

            // update the alpha (transparency) of the particle according to its lifetime
            float ratio = p.lifetime.asSeconds() / particleLifetime.asSeconds();
            particleVertices[i].color.a = static_cast<sf::Uint8>(ratio * 255);
        }
    }

private:

    virtual void draw(sf::RenderTarget& target, sf::RenderStates states) const
    {
        // apply the transform
        states.transform *= getTransform();

        // our particles don't use a texture
        states.texture = NULL;

        // draw the vertex array
        target.draw(particleVertices, states);
    }

private:
    struct Particle
    {
        sf::Vector2f velocity;
        sf::Time lifetime;
    };

    void resetParticle(std::size_t index)
    {
        // give a random velocity and lifetime to the particle
        float angle = (std::rand() % 360) * 3.14f / 180.f;
        float speed = (std::rand() % 50) + 50.f;
        particles[index].velocity = sf::Vector2f(std::cos(angle) * speed, std::sin(angle) * speed);
        particles[index].lifetime = sf::milliseconds((std::rand() % 2000) + 1000);

        // reset the position of the corresponding vertex
        particleVertices[index].position = pos;
    }

    std::vector<Particle> particles;
    sf::VertexArray particleVertices;
    sf::Time particleLifetime;
    sf::Vector2f pos;
};