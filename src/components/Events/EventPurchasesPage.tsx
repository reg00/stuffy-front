import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { PurchaseShortEntry } from '@/api';
import styles from './Event.module.css';

type RouteParams = {
  id: string;
};

type LocationState = {
  purchases?: PurchaseShortEntry[];
};

export const EventPurchasesPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const purchases = state?.purchases ?? [];

  const handleAddPurchase = () => {
    alert('Добавить покупку (заглушка)');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link
            to={`/events/${id}`}
            className={styles.backLink}
          >
            ← Назад к ивенту
          </Link>
        </div>
        <div className={styles.narrow}>
            <h1 className={styles.sectionTitle}>Покупки</h1>

            <button
            type="button"
            onClick={handleAddPurchase}
            className={styles.addButton}
            >
            + Добавить покупку
            </button>

            {purchases.length === 0 && (
            <p className={styles.emptyText}>
                Покупок пока нет. Добавьте первую.
            </p>
            )}

            <ul className={styles.list}>
            {purchases.map(p => (
                <li key={p.id} className={styles.listItem}>
                <div className={styles.purchaseInfo}>
                    <span>{p.name}</span>
                    <span className={styles.purchaseStatus}>
                    {p.isComplete ? 'Оплачено' : 'Не оплачено'}
                    </span>
                </div>
                <span className={styles.purchaseAmount}>{p.cost} ₽</span>
                </li>
            ))}
            </ul>

            {!state && (
            <p className={styles.hintText}>
                Страница открыта без state — вернитесь на детальную ивента и зайдите
                повторно.
            </p>
            )}
        </div>
      </div>
    </div>
  );
};
