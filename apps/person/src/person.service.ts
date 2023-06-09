import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Repository } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { FilmPerson, FilmRole, Person, PersonFilmRole } from './entities';
import { ICreatePerson, IShortPerson } from './interface/person.interface';
import sequelize from 'sequelize';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person) private personRepository: Repository<Person>,
    @InjectModel(FilmPerson)
    private filmPersonRepository: Repository<FilmPerson>,
    @InjectModel(FilmRole) private filmRoleRepository: Repository<FilmRole>,
    @InjectModel(PersonFilmRole)
    private personFilmRoleRepository: Repository<PersonFilmRole>,
  ) {}

  private generateUUID(): string {
    return uuid();
  }

  async getPerson(person_id: string): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { person_id },
      include: [
        {
          model: FilmRole,
          attributes: ['film_role_id', 'film_role', 'slug'],
          through: {
            attributes: [],
          },
        },
        {
          model: FilmPerson,
          attributes: ['film_id'],
        },
      ],
    });

    if (!person) {
      return null;
    }

    const films = this.filteredUniqueFilmIds(person.films);

    person.dataValues.films = films;

    return person;
  }

  async getAllPersons(queryLimit: { limit: string }): Promise<Person[]> {
    const { limit } = queryLimit;

    const persons = await this.personRepository.findAll({
      include: [
        {
          model: FilmRole,
          attributes: ['film_role_id', 'film_role', 'slug'],
          through: {
            attributes: [],
          },
        },
        {
          model: FilmPerson,
          attributes: ['film_id'],
        },
      ],
      limit: limit ? +limit : 100,
    });

    return persons;
  }

  async getPersonsFromFilm(film_id: string): Promise<Person[]> {
    const personsFromFilm = await this.personRepository.findAll({
      include: [
        {
          model: FilmRole,
          attributes: ['film_role_id', 'film_role', 'slug'],
          through: {
            attributes: [],
          },
        },
        {
          model: FilmPerson,
          // where: { film_id },
          attributes: ['film_id'],
        },
      ],
    });

    // добавляем количество фильмов у персонажа, если делать через where нет количества фильмов
    return personsFromFilm.filter((person) =>
      person.films.map((film) => film.film_id).includes(film_id),
    );
  }

  async getPersonsByName(person: IShortPerson): Promise<Person[]> {
    const { first_name, last_name, film_role } = person;
    const first_name_lower = first_name ? first_name.toLowerCase() : '';
    const last_name_lower = last_name ? last_name.toLowerCase() : '';

    const personsFits = await this.personRepository.findAll({
      where: {
        [Op.or]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('first_name_ru')),
            {
              [Op.substring]: first_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('last_name_ru')),
            {
              [Op.substring]: last_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('first_name_en')),
            {
              [Op.substring]: first_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('last_name_en')),
            {
              [Op.substring]: last_name_lower,
            },
          ),
        ],
      },
      include: [
        {
          model: FilmRole,
          where: { [Op.or]: [{ film_role }, { slug: film_role }] },
          attributes: ['film_role_id', 'film_role', 'slug'],
          through: {
            attributes: [],
          },
        },
        {
          model: FilmPerson,
          attributes: ['film_id'],
        },
      ],
    });

    return personsFits;
  }

  async getFilmsByPerson(person: IShortPerson): Promise<Person> {
    const { first_name, last_name, film_role } = person;
    const first_name_lower = first_name ? first_name.toLowerCase() : '';
    const last_name_lower = last_name ? last_name.toLowerCase() : '';

    const filmsPerson = await this.personRepository.findOne({
      where: {
        [Op.or]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('first_name_ru')),
            {
              [Op.substring]: first_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('last_name_ru')),
            {
              [Op.substring]: last_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('first_name_en')),
            {
              [Op.substring]: first_name_lower,
            },
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('last_name_en')),
            {
              [Op.substring]: last_name_lower,
            },
          ),
        ],
      },
      include: [
        {
          model: FilmRole,
          where: { film_role: film_role.toLowerCase() },
          attributes: [],
          through: {
            attributes: [],
          },
        },
        {
          model: FilmPerson,
          attributes: ['film_id'],
        },
      ],
    });

    return filmsPerson;
  }

  async addPersonsFromFilm(
    persons: ICreatePerson[],
    film_id: string,
  ): Promise<Person[]> {
    persons.forEach(async (person) => {
      const {
        film_role,
        film_role_slug,
        first_name_ru,
        last_name_ru,
        first_name_en,
        last_name_en,
        img,
      } = person;

      const checkPerson = await this.personRepository.findOrCreate({
        where: { first_name_ru, last_name_ru },
        defaults: {
          person_id: this.generateUUID(),
          first_name_ru,
          last_name_ru,
          first_name_en,
          last_name_en,
          img,
        },
      });

      const { person_id } = checkPerson[0];

      const checkFilmRole = await this.filmRoleRepository.findOrCreate({
        where: { film_role: film_role.toLowerCase() },
        defaults: {
          film_role_id: this.generateUUID(),
          film_role: film_role.toLowerCase(),
          slug: film_role_slug.toLowerCase(),
        },
      });

      const { film_role_id } = checkFilmRole[0];

      await this.personFilmRoleRepository.findOrCreate({
        where: { person_id, film_role_id },
        defaults: {
          person_film_role_id: this.generateUUID(),
          person_id,
          film_role_id,
        },
      });

      await this.filmPersonRepository.findOrCreate({
        where: { film_id },
        include: [
          {
            model: Person,
            where: { person_id },
          },
        ],
        defaults: {
          film_person_id: this.generateUUID(),
          film_id,
          person_id,
        },
      });
    });

    const personsFilm = await this.getPersonsFromFilm(film_id);

    return personsFilm;
  }

  private filteredUniqueFilmIds(films: FilmPerson[]): FilmPerson[] {
    const filmsId = [];

    // Извлечь только уникальные значения film_id
    const uniqueFilmIds = films.filter((film: { film_id: string }) => {
      if (!filmsId.includes(film.film_id)) {
        filmsId.push(film.film_id);

        return true;
      }

      return false;
    });

    filmsId.length = 0;

    return uniqueFilmIds;
  }
}
