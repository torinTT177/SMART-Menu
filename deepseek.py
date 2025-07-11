from openai import OpenAI
import os

class DeepseekAPI:
    def __init__(self, api_key=None):
        """
        初始化Deepseek API客户端
        
        Args:
            api_key: Deepseek API密钥，如果为None则从环境变量DEEPSEEK_API_KEY读取
        """
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("未提供API密钥且环境变量DEEPSEEK_API_KEY未设置")
            
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.deepseek.com/"
        )
    
    def chat_completion(self, messages, model="deepseek-chat", **kwargs):
        """
        发送聊天补全请求
        
        Args:
            messages: 消息列表，格式为[{"role": "user", "content": "消息内容"}]
            model: 使用的模型名称
            **kwargs: 其他可选参数如temperature, max_tokens等
            
        Returns:
            聊天补全响应
        """
        return self.client.chat.completions.create(
            model=model,
            messages=messages,
            **kwargs
        )

# 示例用法
if __name__ == "__main__":
    # 从环境变量或直接提供API密钥
    api_key = "sk-4f71f7b2b6c246f0a6392acae42c0ed1"  # 替换为你的API密钥
    
    try:
        deepseek = DeepseekAPI(api_key)
        
        # 示例聊天消息
        messages = [
            {"role": "user", "content": "Brawl Star的中文名称是什么？"}
        ]
        
        response = deepseek.chat_completion(
            messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"发生错误: {str(e)}")