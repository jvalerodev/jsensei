# Scripts Deprecados (v1.0)

⚠️ **ESTOS SCRIPTS ESTÁN DEPRECADOS Y NO DEBEN USARSE**

Esta carpeta contiene los scripts de la versión anterior (v1.0) de JSensei que han sido reemplazados por una estructura optimizada en v2.0.

## 📁 Contenido

- `000_setup_ai_system.sql` - Script maestro anterior
- `001_create_database_schema.sql` - Esquema base anterior  
- `002_seed_placement_questions.sql` - Preguntas de nivelación anteriores
- `003_modern_js_questions.sql` - Preguntas adicionales
- `004_create_ai_tables.sql` - Tablas de IA anteriores (15+ tablas)
- `005_update_users_table.sql` - Actualizaciones de usuarios
- `006_seed_ai_data.sql` - Datos de ejemplo anteriores
- `999_verify_installation.sql` - Verificación anterior

## 🚫 ¿Por qué están deprecados?

La estructura v1.0 tenía varios problemas:

- **Demasiadas tablas** (15+ vs 8 en v2.0)
- **Redundancia de datos** entre tablas similares
- **Consultas complejas** con múltiples JOINs
- **Difícil mantenimiento** y escalabilidad
- **Performance subóptimo**

## ✅ ¿Qué usar en su lugar?

Usa la nueva estructura v2.0:

```bash
# Instalación nueva
psql -f ../000_setup_jsensei.sql

# Migración desde v1.0
psql -f ../003_migration_helper.sql
```

## 🗑️ ¿Cuándo eliminar?

Estos archivos se pueden eliminar después de:

1. ✅ Confirmar que la migración a v2.0 fue exitosa
2. ✅ Verificar que todos los datos se migraron correctamente
3. ✅ Probar la funcionalidad completa en v2.0
4. ✅ Hacer un respaldo completo de la base de datos

## 📞 Soporte

Si necesitas ayuda con la migración, consulta:
- `../003_migration_helper.sql` - Herramientas de migración
- `../README.md` - Documentación completa v2.0
