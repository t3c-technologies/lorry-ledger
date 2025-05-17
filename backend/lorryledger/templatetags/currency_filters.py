# In your_app/templatetags/__init__.py
# Make sure this file exists (can be empty)

# In your_app/templatetags/currency_filters.py (or whatever you named your file)
from django import template
from num2words import num2words
from decimal import Decimal, ROUND_HALF_UP

register = template.Library()

@register.filter(name='indian_currency')
def indian_currency(value):
    """
    Format a number as Indian currency (with comma separators)
    e.g. 3000 -> ₹3,000.00, 300000 -> ₹3,00,000.00
    """
    if value is None:
        return "₹0.00"
        
    # Convert to decimal for proper rounding
    try:
        value = Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except:
        return "₹0.00"
        
    # Format as string with 2 decimal places
    value_str = str(value)
        
    # Split into whole and decimal parts
    if '.' in value_str:
        whole, decimal = value_str.split('.')
        # Ensure decimal part is 2 digits
        decimal = decimal.ljust(2, '0')[:2]
    else:
        whole = value_str
        decimal = '00'
        
    # Format the whole part with Indian-style comma separators
    result = ""
    count = 0
    for i in range(len(whole)-1, -1, -1):
        count += 1
        result = whole[i] + result
        if count == 3 and i != 0:
            result = ',' + result
            count = 0
        elif count == 2 and i != 0 and len(result) > 4:
            result = ',' + result
            count = 0
        
    return f"₹{result}.{decimal}"

@register.filter(name='amount_in_words')
def amount_in_words(value):
    """
    Convert a number to words with Indian currency format
    e.g. 3000 -> Three Thousand Rupees Only
    """
    if value is None:
        return "Zero Rupees Only"
        
    try:
        # Convert to decimal for proper handling
        value = Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except:
        return "Zero Rupees Only"
        
    # Split into rupees and paise
    rupees = int(value)
    paise = int((value - rupees) * 100 + Decimal('0.5'))  # Round to nearest paise using Decimal
        
    # Convert rupees to words
    if rupees:
        rupees_in_words = num2words(rupees, lang='en_IN').title()
    else:
        rupees_in_words = "Zero"
        
    # Add paise if any
    if paise:
        paise_in_words = num2words(paise, lang='en_IN').title()
        return f"{rupees_in_words} Rupees and {paise_in_words} Paise Only"
    else:
        return f"{rupees_in_words} Rupees Only"

@register.filter(name='add')
def add_values(value1, value2):
    """
    Add two values together by converting to float first
    This helps overcome type conversion issues with Decimal
    """
    try:
        # Handle None values
        val1 = value1 if value1 is not None else 0
        val2 = value2 if value2 is not None else 0
        
        # Convert to float regardless of input type
        try:
            float1 = float(val1)
        except (TypeError, ValueError):
            float1 = 0.0
            
        try:
            float2 = float(val2)
        except (TypeError, ValueError):
            float2 = 0.0
            
        # Calculate the sum
        result = float1 + float2
        
        return result
    except Exception as e:
        print(f"Addition error: {e}")
        return 0