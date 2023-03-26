
import java.util.Map;

// -------------------------------------------------------
//
// Top level needs:
// - Current state
// - Target state
// - Possible changes
// - Method to evaluate changes
// - Solver to resolve if changes are possible
// 
// -------------------------------------------------------

abstract public class Property<T> {

    protected String key;
    protected T value;

    Property(String key, T value) {
        this.key = key;
        this.value = value;
    }

    public boolean equals(Property<T> other) { return getValue() == other.getValue(); }

    public String getKey() { return key; }

    public T getValue() { return value; }
}

public class PropertyBoolean extends Property<Boolean> {

    PropertyBoolean(String key, boolean value) {
        super(key, value);
    }
}

public class PropertyFloat extends Property<Float> {

    PropertyFloat(String key, float value) {
        super(key, value);
    }
}

// -------------------------------------------------------

abstract public class Action<T extends Property> {

    public abstract T act(T property);
}

public class ActionBoolean extends Action<PropertyBoolean> {

    public PropertyBoolean act(PropertyBoolean property) {
        boolean newValue = !property.getValue();
        return new PropertyBoolean(property.getKey(), newValue);
    }
}

public class ActionFloat extends Action<PropertyFloat> {

    public float change;

    ActionFloat(float change) {
        this.change = change;
    }

    public PropertyFloat act(PropertyFloat property) {
        float newValue = property.getValue() + this.change;
        return new PropertyFloat(property.getKey(), newValue);
    }
}

// -------------------------------------------------------

// class Entity {

//     public HashMap<String, Property> properties;

//     public Entity(ArrayList<Property> properties)
//     {
//         this.properties = new HashMap<String, Property>();
        
//     }
// }

// class Agent extends Entity {

//     public ArrayList<Action> actions;

//     public Agent(ArrayList<Property> properties, ArrayList<Action> actions) {
//         super(properties);
//         this.actions = new ArrayList<Action>();
//     }
// }

// -------------------------------------------------------

// class Problem {

// }

// -------------------------------------------------------

void setup() {
    size(800, 800);
}


void draw() {
    background(0);
}
