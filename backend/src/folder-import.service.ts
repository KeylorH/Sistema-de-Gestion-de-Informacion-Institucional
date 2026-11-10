import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FolderImportService {
  private readonly logger = new Logger(FolderImportService.name);

  constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
  ) {}

  /**
   * Lee el archivo de texto estructurado y guarda la jerarquía de carpetas
   * con sus correspondientes códigos, colores y niveles.
   */
  async importFromFile(filePath: string = 'clasificacionOrdenamiento.txt') {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      this.logger.warn(`No se encontró el archivo de clasificación en: ${absolutePath}`);
      return;
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    this.logger.log('Iniciando importación del árbol de archivos...');

    const codeToFolderMap = new Map<string, Folder>();
    let rootFolder: Folder | null = null;

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split('|');
      if (parts.length < 2) continue;

      const level = parseInt(parts[0].trim(), 10);
      const content = parts[1].trim();

      // Nivel 0: Carpeta principal / Raíz de la institución
      if (level === 0) {
        rootFolder = await this.folderRepo.findOne({ where: { code: 'ROOT' } });
        if (!rootFolder) {
          rootFolder = await this.folderRepo.save(
            this.folderRepo.create({
              name: content,
              code: 'ROOT',
              level: 0,
              color: 'Red',
              sortOrder: 0,
              parent: null,
            }),
          );
        }
        codeToFolderMap.set('ROOT', rootFolder);
        continue;
      }

      // Niveles 1 en adelante: CODE¬NOMBRE¬COLOR
      const subParts = content.split('¬');
      if (subParts.length < 2) continue;

      const code = subParts[0].trim();
      const name = subParts[1].trim();
      const color = subParts[2] ? subParts[2].trim() : 'Default';

      const parentCode = this.getParentCode(code);
      const parent = codeToFolderMap.get(parentCode) || rootFolder;

      let folder = await this.folderRepo.findOne({ where: { code } });
      if (!folder) {
        folder = this.folderRepo.create({
          name,
          code,
          level,
          color,
          parent: parent || undefined,
        });
        folder = await this.folderRepo.save(folder);
        this.logger.log(`Carpeta creada: [${code}] ${name} (${color})`);
      } else {
        folder.name = name;
        folder.level = level;
        folder.color = color;
        folder.parent = parent || undefined;
        folder = await this.folderRepo.save(folder);
      }

      codeToFolderMap.set(code, folder);
    }

    this.logger.log('¡Importación de carpetas finalizada con éxito!');
  }

  /**
   * Deduce el código del padre según la nomenclatura lógica (ej. '2-1.1.1' -> '2-1.1')
   */
  private getParentCode(code: string): string {
    if (code.includes('.')) {
      const lastDotIndex = code.lastIndexOf('.');
      return code.substring(0, lastDotIndex);
    }
    if (code.includes('-')) {
      const lastHyphenIndex = code.lastIndexOf('-');
      return code.substring(0, lastHyphenIndex);
    }
    return 'ROOT';
  }
}