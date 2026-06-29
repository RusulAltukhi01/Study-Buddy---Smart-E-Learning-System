import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from peft import PeftModel

# Load model
base_model = AutoModelForCausalLM.from_pretrained(
    'mistralai/Mistral-7B-Instruct-v0.2',
    device_map='auto',
    torch_dtype=torch.float16
)
tokenizer = AutoTokenizer.from_pretrained('mistralai/Mistral-7B-Instruct-v0.2')
model = PeftModel.from_pretrained(base_model, './lora')

# Create pipeline
generator = pipeline('text-generation', model=model, tokenizer=tokenizer)

# Generate quiz
prompt = """### Instruction
Generate computer science quiz questions.

### Input
What is a neural network and how does it learn?

### Response"""

result = generator(prompt, max_new_tokens=300, do_sample=True, temperature=0.7)[0]['generated_text']
print(result)
