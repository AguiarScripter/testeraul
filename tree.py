import os
from pathlib import Path

def print_tree(directory, ignore_dirs=['.git', 'node_modules', '__pycache__'], ignore_files=['.gitignore', '.env'], prefix=''):
    """
    Imprime a estrutura de diretórios em formato de árvore.
    
    Args:
        directory (str): Caminho do diretório
        ignore_dirs (list): Lista de diretórios para ignorar
        ignore_files (list): Lista de arquivos para ignorar
        prefix (str): Prefixo para indentação
    """
    # Obtém o diretório atual
    directory = Path(directory)
    
    # Lista todos os arquivos e diretórios
    entries = sorted(directory.iterdir())
    
    # Filtra os arquivos e diretórios ignorados
    entries = [e for e in entries 
              if e.name not in ignore_dirs 
              and e.name not in ignore_files 
              and not e.name.startswith('.')]
    
    # Processa cada entrada
    for i, entry in enumerate(entries):
        is_last = i == len(entries) - 1
        current_prefix = '└── ' if is_last else '├── '
        print(f"{prefix}{current_prefix}{entry.name}")
        
        if entry.is_dir():
            extension_prefix = '    ' if is_last else '│   '
            print_tree(entry, ignore_dirs, ignore_files, prefix + extension_prefix)

if __name__ == '__main__':
    # Obtém o diretório atual
    current_dir = os.getcwd()
    print(f"\nEstrutura do projeto: {os.path.basename(current_dir)}")
    print("="*50)
    print_tree(current_dir)