import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface FilmCreationAttrs {
  film_id: string;
  name_ru: string;
  name_en?: string;
  description: string;
  year: number;
  country: string;
  rating: number;
  assessments: number;
  reviews: number;
  quality: string;
  age_limit: number;
  duration: string;
}

@Table({ tableName: 'film', timestamps: false })
export class Film extends Model<Film, FilmCreationAttrs> {
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
  })
  readonly film_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name_ru: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name_en: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  year: number;

  @Column({ type: DataType.STRING, allowNull: false })
  country: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  rating: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  assessments: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  reviews: number;

  @Column({ type: DataType.STRING, allowNull: false })
  quality: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  age_limit: number;

  @Column({ type: DataType.STRING, allowNull: false })
  duration: string;
}
