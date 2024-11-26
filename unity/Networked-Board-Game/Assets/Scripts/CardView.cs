using UnityEngine;

public class CardView : MonoBehaviour
{
    [Header("References")]
    public TMPro.TextMeshProUGUI titleText;

    public void SetTitle(string title)
    {
        titleText.text = title;
    }
}
