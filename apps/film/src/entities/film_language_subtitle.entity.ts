import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Film } from './film.entity';
import { Language } from './language.entity';

@Table({ tableName: 'film_language_subtitle', timestamps: false })
export class FilmLanguageSubtitle extends Model<FilmLanguageSubtitle> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  film_language_subtitle_id: number;

  @ForeignKey(() => Film)
  @Column({ type: DataType.STRING })
  film_id: string;

  @ForeignKey(() => Language)
  @Column({ type: DataType.INTEGER })
  language_id: number;
}